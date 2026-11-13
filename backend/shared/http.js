/**
 * Tiny HTTP application layer built only on node: built-ins.
 *
 * It reproduces, for the subset that the Passager services use, the observable
 * behaviour that the previous Express based stack had:
 *  - Bearer token validation (never rejects: anonymous requests get `{ email: null }`).
 *  - `cors()` defaults: `Access-Control-Allow-Origin: *` and 204 preflight responses.
 *  - `express.json()` defaults: only `application/json`, 100kb limit, strict mode.
 *  - Express 4 routing: case insensitive, optional trailing slash, decoded params.
 *  - `{ success, message }` JSON envelopes with 200 / 500 status codes.
 */
import { createServer } from 'node:http'
import { gunzip, inflate } from 'node:zlib'
import { promisify } from 'node:util'
import { verifyToken } from './jwt.js'

const gunzipAsync = promisify(gunzip)
const inflateAsync = promisify(inflate)

const JSON_BODY_LIMIT_IN_BYTES = 100 * 1024
const CORS_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE'
const FIRST_NON_WHITESPACE_CHARACTER = /^[\x20\x09\x0a\x0d]*([^\x20\x09\x0a\x0d])/

class HttpError extends Error {
  constructor (status, message) {
    super(message)
    this.status = status
  }
}

const STATUS_MESSAGES = {
  400: 'Bad Request',
  404: 'Not Found',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  500: 'Internal Server Error'
}

const escapeHtml = (text) => String(text)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

// Same encoding Express applies to the path it echoes in "Cannot METHOD /path" pages
const UNSAFE_URL_CHARACTERS = /(?:[^\x21\x23-\x3B\x3D\x3F-\x5F\x61-\x7A\x7C\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g
const encodeUrl = (url) => {
  try {
    return String(url).replace(UNSAFE_URL_CHARACTERS, encodeURI)
  } catch (e) {
    return ''
  }
}

const sendHtmlError = (req, res, status, text) => {
  const body = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>Error</title>\n' +
    '</head>\n' +
    '<body>\n' +
    `<pre>${escapeHtml(text)}</pre>\n` +
    '</body>\n' +
    '</html>\n'

  res.statusCode = status
  res.setHeader('Content-Security-Policy', "default-src 'none'")
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.end(req.method === 'HEAD' ? undefined : body)
}

const sendJson = (req, res, status, payload) => {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.end(req.method === 'HEAD' ? undefined : body)
}

/**
 * Equivalent to the previous token middleware: it never blocks a request,
 * it only identifies the user when a valid token is received.
 */
const getUserFromRequest = (req, tokenSecret) => {
  const anonymousUser = { email: null }
  const authorizationHeader = req.headers.authorization
  const token = authorizationHeader && authorizationHeader.split(' ')[1]

  if (token == null) return anonymousUser

  try {
    return verifyToken(token, tokenSecret)
  } catch (e) {
    return anonymousUser
  }
}

/**
 * Applies CORS headers. Returns true if the request was a preflight and has been answered.
 */
const handleCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'OPTIONS') return false

  res.setHeader('Access-Control-Allow-Methods', CORS_ALLOWED_METHODS)
  res.setHeader('Vary', 'Access-Control-Request-Headers')
  const requestedHeaders = req.headers['access-control-request-headers']
  if (requestedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestedHeaders)
  }
  res.statusCode = 204
  res.setHeader('Content-Length', '0')
  res.end()
  return true
}

const hasBody = (req) =>
  req.headers['transfer-encoding'] !== undefined ||
  !isNaN(req.headers['content-length'])

const isJsonContentType = (req) => {
  const contentType = req.headers['content-type']
  if (typeof contentType !== 'string') return false
  const mediaType = contentType.split(';')[0].trim().toLowerCase()
  return mediaType === 'application/json'
}

const getCharset = (req) => {
  const match = /;\s*charset\s*=\s*("?)([^";\s]+)\1/i.exec(req.headers['content-type'] || '')
  return (match ? match[2] : 'utf-8').toLowerCase()
}

const readRawBody = (req, limit) => new Promise((resolve, reject) => {
  const declaredLength = Number(req.headers['content-length'])
  if (!isNaN(declaredLength) && declaredLength > limit) {
    req.resume()
    reject(new HttpError(413, 'request entity too large'))
    return
  }

  const chunks = []
  let received = 0
  let finished = false
  const finish = (callback, value) => {
    if (finished) return
    finished = true
    callback(value)
  }

  req.on('data', (chunk) => {
    if (finished) return
    received += chunk.length
    if (received > limit) {
      req.resume()
      finish(reject, new HttpError(413, 'request entity too large'))
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => finish(resolve, Buffer.concat(chunks)))
  req.on('aborted', () => finish(reject, new HttpError(400, 'request aborted')))
  req.on('error', () => finish(reject, new HttpError(400, 'request error')))
})

const decodeBody = async (req, rawBody) => {
  const encoding = (req.headers['content-encoding'] || 'identity').toLowerCase()
  const options = { maxOutputLength: JSON_BODY_LIMIT_IN_BYTES }
  try {
    switch (encoding) {
      case 'identity': return rawBody
      case 'gzip': return await gunzipAsync(rawBody, options)
      case 'deflate': return await inflateAsync(rawBody, options)
    }
  } catch (e) {
    if (e?.code === 'ERR_BUFFER_TOO_LARGE') throw new HttpError(413, 'request entity too large')
    throw new HttpError(400, 'invalid request body')
  }
  throw new HttpError(415, `unsupported content encoding "${encoding}"`)
}

/**
 * Parses a JSON body exactly when the previous stack did. Any other request gets `{}`.
 */
const parseJsonBody = async (req) => {
  if (!hasBody(req) || !isJsonContentType(req)) {
    return {}
  }

  const charset = getCharset(req)
  if (!charset.startsWith('utf-')) {
    throw new HttpError(415, `unsupported charset "${charset.toUpperCase()}"`)
  }

  const rawBody = await readRawBody(req, JSON_BODY_LIMIT_IN_BYTES)
  const text = (await decodeBody(req, rawBody)).toString('utf8')

  if (text.length === 0) return {}

  // Strict mode: only objects and arrays are accepted
  const firstCharacter = FIRST_NON_WHITESPACE_CHARACTER.exec(text)?.[1]
  if (firstCharacter !== '{' && firstCharacter !== '[') {
    throw new HttpError(400, 'invalid json')
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    throw new HttpError(400, 'invalid json')
  }
}

const compileRoute = (pattern) => {
  const paramNames = []
  const source = pattern
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1))
        return '([^/]+?)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')

  return {
    regexp: new RegExp(`^/${source}/?$`, 'i'),
    paramNames
  }
}

const getPathname = (req) => {
  const url = req.url || '/'
  const queryStart = url.indexOf('?')
  return queryStart === -1 ? url : url.slice(0, queryStart)
}

/**
 * Creates an application.
 * @param {{getTokenSecret: () => string}} options
 */
export const createApp = ({ getTokenSecret }) => {
  const routes = []

  const addRoute = (method, pattern, handler) => {
    routes.push({ method, handler, ...compileRoute(pattern) })
  }

  const findRoute = (method, pathname) => {
    // As Express does, HEAD requests are served by GET routes
    const routeMethod = method === 'HEAD' ? 'GET' : method

    for (const route of routes) {
      if (route.method !== routeMethod) continue
      const match = route.regexp.exec(pathname)
      if (match === null) continue

      const params = {}
      route.paramNames.forEach((name, index) => {
        try {
          params[name] = decodeURIComponent(match[index + 1])
        } catch (e) {
          throw new HttpError(400, `Failed to decode param '${match[index + 1]}'`)
        }
      })
      return { route, params }
    }

    return null
  }

  const handle = async (req, res) => {
    try {
      req.user = getUserFromRequest(req, getTokenSecret())

      if (handleCors(req, res)) return

      req.body = await parseJsonBody(req)

      const pathname = getPathname(req)
      const found = findRoute(req.method, pathname)
      if (found === null) {
        sendHtmlError(req, res, 404, `Cannot ${req.method} ${encodeUrl(pathname)}`)
        return
      }

      req.params = found.params
      const context = {
        req,
        res,
        success: (message) => sendJson(req, res, 200, { success: true, message }),
        error: (message) => {
          if (process.env.NODE_ENV === 'development') console.dir(message)
          sendJson(req, res, 500, { success: false, message })
        },
        json: (payload) => sendJson(req, res, 200, payload)
      }

      try {
        await found.route.handler(context)
      } catch (e) {
        // Same contract controllers always had: any failure is a 500 with the reason as message
        context.error(e)
      }
    } catch (e) {
      if (res.headersSent) {
        res.destroy()
        return
      }
      const status = e instanceof HttpError ? e.status : 500
      if (!(e instanceof HttpError)) console.error(e)
      sendHtmlError(req, res, status, STATUS_MESSAGES[status] || 'Error')
    }
  }

  return {
    get: (pattern, handler) => addRoute('GET', pattern, handler),
    post: (pattern, handler) => addRoute('POST', pattern, handler),
    patch: (pattern, handler) => addRoute('PATCH', pattern, handler),
    delete: (pattern, handler) => addRoute('DELETE', pattern, handler),
    handle,
    /**
     * Starts listening. Resolves with the node http.Server once it is ready.
     */
    listen: (port, host) => new Promise((resolve, reject) => {
      const server = createServer((req, res) => { handle(req, res) })
      server.once('error', reject)
      server.listen(port, host, () => resolve(server))
    })
  }
}
