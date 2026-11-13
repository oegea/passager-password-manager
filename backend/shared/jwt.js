/**
 * Minimal JSON Web Token (HMAC) implementation on top of node:crypto.
 *
 * It is wire-compatible with the tokens that previous versions of the backend
 * issued and verified through the `jsonwebtoken` package:
 *  - Tokens are signed with HS256 and carry `iat` and `exp` claims (seconds).
 *  - Verification accepts HS256, HS384 and HS512 (what `jsonwebtoken` accepts
 *    for shared secrets), and enforces `exp` and `nbf`.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

const HMAC_ALGORITHMS = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512'
}

const base64UrlEncode = (input) => Buffer.from(input).toString('base64url')

const computeSignature = (algorithm, secret, signingInput) =>
  createHmac(HMAC_ALGORITHMS[algorithm], secret).update(signingInput).digest()

const nowInSeconds = () => Math.floor(Date.now() / 1000)

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Signs a payload using HS256.
 * @param {object} payload Claims to include in the token
 * @param {string} secret Shared secret
 * @param {{expiresInSeconds?: number}} options
 * @returns {string} Compact JWT
 */
export const signToken = (payload, secret, { expiresInSeconds } = {}) => {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('secretOrPrivateKey must have a value')
  }
  if (!isPlainObject(payload)) {
    throw new Error('payload must be a plain object')
  }

  const iat = nowInSeconds()
  const claims = { ...payload, iat }
  if (expiresInSeconds !== undefined) {
    claims.exp = iat + expiresInSeconds
  }

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(claims))
  const signingInput = `${header}.${body}`
  const signature = computeSignature('HS256', secret, signingInput).toString('base64url')

  return `${signingInput}.${signature}`
}

/**
 * Verifies a token and returns its payload.
 * Throws an Error if the token is malformed, tampered, expired or not active yet.
 * @param {string} token Compact JWT
 * @param {string} secret Shared secret
 * @returns {any} Decoded payload
 */
export const verifyToken = (token, secret) => {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('secret or public key must be provided')
  }
  if (typeof token !== 'string') {
    throw new Error('jwt must be a string')
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('jwt malformed')
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts

  let header
  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'))
  } catch (e) {
    throw new Error('invalid token')
  }
  if (!isPlainObject(header)) {
    throw new Error('invalid token')
  }

  // Only HMAC algorithms are accepted. In particular "none" and asymmetric
  // algorithms are rejected, so the secret can never be misused as a public key.
  if (typeof header.alg !== 'string' || !Object.hasOwn(HMAC_ALGORITHMS, header.alg)) {
    throw new Error('invalid algorithm')
  }

  if (encodedSignature.length === 0) {
    throw new Error('jwt signature is required')
  }

  const expectedSignature = computeSignature(header.alg, secret, `${encodedHeader}.${encodedPayload}`)
  const receivedSignature = Buffer.from(encodedSignature, 'base64url')
  if (
    // Reject non canonical encodings of the signature
    receivedSignature.toString('base64url') !== encodedSignature ||
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    throw new Error('invalid signature')
  }

  let payload
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
  } catch (e) {
    throw new Error('invalid token')
  }

  if (!isPlainObject(payload)) {
    return payload
  }

  const clockTimestamp = nowInSeconds()

  if (payload.nbf !== undefined) {
    if (typeof payload.nbf !== 'number') {
      throw new Error('invalid nbf value')
    }
    if (payload.nbf > clockTimestamp) {
      throw new Error('jwt not active')
    }
  }

  if (payload.exp !== undefined) {
    if (typeof payload.exp !== 'number') {
      throw new Error('invalid exp value')
    }
    if (clockTimestamp >= payload.exp) {
      throw new Error('jwt expired')
    }
  }

  return payload
}
