/**
 * Minimal HTTP client for tests, with full control over what is sent.
 */
import http from 'node:http'

export const request = ({ port, method, path, headers = {}, body }) => new Promise((resolve, reject) => {
  const payload = body === undefined ? undefined : Buffer.from(body)
  const req = http.request({
    host: '127.0.0.1',
    port,
    method,
    path,
    headers: payload === undefined ? headers : { ...headers, 'Content-Length': payload.length }
  }, (res) => {
    const chunks = []
    res.on('data', (chunk) => chunks.push(chunk))
    res.on('end', () => resolve({
      status: res.statusCode,
      headers: res.headers,
      body: Buffer.concat(chunks).toString('utf8')
    }))
  })
  req.on('error', reject)
  req.end(payload)
})

const COMPARED_HEADERS = [
  'content-type',
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'vary',
  'content-security-policy',
  'x-content-type-options'
]

/**
 * Creates a function that turns a response into a comparable snapshot:
 * generated identifiers and tokens are replaced by stable placeholders.
 */
export const createNormalizer = () => {
  const knownIds = new Map()
  const normalizeText = (text) => text
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '<jwt>')
    .replace(/[0-9a-f]{24}/g, (id) => {
      if (!knownIds.has(id)) knownIds.set(id, `<id:${knownIds.size + 1}>`)
      return knownIds.get(id)
    })

  return (response) => {
    const headers = {}
    for (const name of COMPARED_HEADERS) {
      if (response.headers[name] !== undefined) headers[name] = response.headers[name]
    }

    const isJson = (response.headers['content-type'] || '').includes('application/json')
    let body = normalizeText(response.body)
    if (isJson && body.length > 0) {
      body = JSON.parse(body)
    } else if (!isJson && response.status !== 404 && body.length > 0) {
      // HTML error pages: only the status code is part of the contract
      body = '<error page>'
    }

    return { status: response.status, headers, body }
  }
}
