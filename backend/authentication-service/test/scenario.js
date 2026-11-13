/**
 * Sequence of HTTP requests that exercises the authentication service under
 * several configurations.
 *
 * `golden.json` holds what the original service answered and
 * e-mailed for this exact sequence. The service must keep behaving the same.
 */

export const ALICE = 'alice@example.com'

const start = (name, email, options = {}) => ({ name, kind: 'start', email, ...options })
const validate = (name, email, code, options = {}) => ({ name, kind: 'validate', email, code, ...options })
const raw = (name, method, path) => ({ name, kind: 'raw', method, path })

/**
 * Groups of steps. Each group runs against a service started with `env` on top of the base configuration.
 * In validate steps, `code` is a function of the code that was really generated for the e-mail.
 */
export const groups = [
  {
    name: 'default configuration',
    env: {},
    steps: [
      raw('unknown route', 'GET', '/unknown'),
      raw('login without email', 'GET', '/login/'),
      raw('preflight', 'OPTIONS', '/login/alice@example.com'),
      raw('post is not supported', 'POST', '/login/alice@example.com'),
      start('invalid email', 'not-an-email'),
      start('invalid email with HEAD', 'not-an-email', { method: 'HEAD' }),
      start('email longer than 255 characters', `${'a'.repeat(250)}@example.com`),
      validate('validate with an invalid email', 'not-an-email', () => '1234567'),
      validate('validate an email that never started a login', 'nobody@example.com', () => '1234567'),
      start('start login', ALICE),
      validate('wrong code', ALICE, (code) => String(code === 9999999 ? code - 1 : code + 1)),
      validate('right code after a wrong attempt is no longer valid', ALICE, (code) => String(code)),
      start('start login with an encoded email', ALICE, { path: '/login/alice%40example.com' }),
      validate('code that is not a number', ALICE, () => 'abc'),
      start('start login again', ALICE),
      start('a new login replaces the previous code', ALICE),
      validate('right code', ALICE, (code) => String(code)),
      validate('a code cannot be used twice', ALICE, (code) => String(code)),
      start('start login ignoring case and trailing slash', ALICE, { path: '/LOGIN/alice@example.com/' }),
      validate('code followed by text', ALICE, (code) => `${code}xyz`),
      start('start login for a session with details', ALICE),
      validate('right code with session details', ALICE, (code) => String(code), { body: { sessionDetails: { device: 'laptop' } } })
    ]
  },
  {
    name: 'access limited by email',
    env: {
      AUTH_LIMIT_ACCESS_BY_EMAIL: 'true',
      AUTH_ALLOWED_DOMAINS: 'example.com, example.org',
      AUTH_ALLOWED_EMAILS: 'vip@other.com, vip2@other.com'
    },
    steps: [
      start('email of a domain that is not allowed', 'mallory@evil.com'),
      start('email of a subdomain of an allowed domain', 'mallory@sub.example.com'),
      start('specifically allowed email', 'vip2@other.com'),
      start('email of an allowed domain', 'bob@example.org'),
      validate('validation does not depend on the allowed list', 'mallory@evil.com', () => '1234567')
    ]
  },
  {
    name: 'access limited by email with any non-empty value and no lists',
    env: {
      AUTH_LIMIT_ACCESS_BY_EMAIL: 'false'
    },
    steps: [
      start('nobody is allowed', ALICE)
    ]
  },
  {
    name: 'smtp server not reachable',
    env: {
      AUTH_SMTP_PORT: '1'
    },
    steps: [
      start('email cannot be sent', ALICE)
    ]
  },
  {
    name: 'html email template',
    env: {
      HTML_EMAIL_TEMPLATE: '<p>Your code is <b>[code]</b>. Do not share [code].</p>'
    },
    steps: [
      start('start login', ALICE)
    ]
  }
]

const decodeTokenPart = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))

/** Describes a token without its variable parts */
const describeToken = (token) => {
  const [header, payload] = token.split('.')
  const claims = decodeTokenPart(payload)
  return {
    header: decodeTokenPart(header),
    claims: Object.keys(claims),
    email: claims.email,
    sessionDetails: claims.sessionDetails,
    durationInSeconds: claims.exp - claims.iat
  }
}

const describeMail = (mail) => ({
  from: mail.from,
  to: mail.to,
  subject: mail.subject,
  text: mail.text?.replace(/\d{7}/g, '<code>'),
  html: mail.html?.replace(/\d{7}/g, '<code>')
})

/**
 * Runs a group against a running service.
 * @param {object} parameters
 * @param {object} parameters.group One of `groups`
 * @param {(request: object) => Promise<object>} parameters.send Sends a request and resolves with the raw response
 * @param {(response: object) => object} parameters.normalize Turns a raw response into a comparable snapshot
 * @param {(email: string) => Promise<number|undefined>} parameters.readCode Reads the stored code of an e-mail
 * @param {() => Promise<object[]>} parameters.takeMails Returns (and forgets) the e-mails sent so far, as { from, to, subject, text, html }
 */
export const runGroup = async ({ group, send, normalize, readCode, takeMails }) => {
  const results = []
  const lastCodes = {}

  for (const step of group.steps) {
    let request
    if (step.kind === 'raw') {
      request = { method: step.method, path: step.path }
    } else if (step.kind === 'start') {
      request = { method: step.method || 'GET', path: step.path || `/login/${step.email}` }
    } else {
      request = { method: 'GET', path: `/login/${step.email}/validate/${step.code(lastCodes[step.email])}` }
      if (step.body) {
        request.body = JSON.stringify(step.body)
        request.headers = { 'Content-Type': 'application/json' }
      }
    }

    const rawResponse = await send(request)
    const result = { name: step.name, response: normalize(rawResponse) }

    if (step.kind === 'start') {
      const storedCode = await readCode(step.email)
      if (storedCode !== undefined) lastCodes[step.email] = storedCode
      result.storedCodeType = typeof storedCode
      result.storedCodeDigits = storedCode === undefined ? 0 : String(storedCode).length
      const mails = await takeMails()
      result.mails = mails.map(describeMail)
      result.everyMailContainsTheStoredCode = mails.every((mail) => `${mail.text}${mail.html}`.includes(String(storedCode)))
    }

    if (step.kind === 'validate' && rawResponse.status === 200) {
      result.token = describeToken(JSON.parse(rawResponse.body).message)
    }

    results.push(result)
  }

  return results
}
