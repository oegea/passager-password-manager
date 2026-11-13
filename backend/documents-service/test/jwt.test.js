import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { signToken, verifyToken } from '../../shared/jwt.js'

const legacyTokens = JSON.parse(readFileSync(new URL('./legacyTokens.json', import.meta.url), 'utf8'))
const SECRET = legacyTokens.secret

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
const forge = (header, payload, secret = SECRET, algorithm = 'sha256') => {
  const signingInput = `${encode(header)}.${encode(payload)}`
  return `${signingInput}.${createHmac(algorithm, secret).update(signingInput).digest('base64url')}`
}

describe('jwt', () => {
  it('signs HS256 tokens with iat and exp claims after the payload', () => {
    const token = signToken({ email: 'alice@example.com', sessionDetails: undefined }, SECRET, { expiresInSeconds: 30 * 24 * 60 * 60 })
    const [header, payload] = token.split('.').slice(0, 2).map((part) => JSON.parse(Buffer.from(part, 'base64url').toString()))

    assert.deepEqual(header, { alg: 'HS256', typ: 'JWT' })
    assert.deepEqual(Object.keys(payload), ['email', 'iat', 'exp'])
    assert.equal(payload.exp - payload.iat, 2592000)
    assert.deepEqual(verifyToken(token, SECRET), payload)
  })

  it('accepts tokens issued by the original service (jsonwebtoken)', () => {
    assert.equal(verifyToken(legacyTokens.legacy, SECRET).email, 'alice@example.com')
    assert.equal(verifyToken(legacyTokens.legacyHS512, SECRET).email, 'alice@example.com')
    assert.throws(() => verifyToken(legacyTokens.legacyExpired, SECRET), /jwt expired/)
  })

  it('rejects tokens signed with another secret', () => {
    const token = signToken({ email: 'alice@example.com' }, 'another-secret', { expiresInSeconds: 60 })
    assert.throws(() => verifyToken(token, SECRET), /invalid signature/)
  })

  it('rejects tampered tokens', () => {
    const [header, , signature] = signToken({ email: 'alice@example.com' }, SECRET, { expiresInSeconds: 60 }).split('.')
    assert.throws(() => verifyToken(`${header}.${encode({ email: 'bob@example.com' })}.${signature}`, SECRET), /invalid signature/)
  })

  it('rejects unsigned tokens and unknown algorithms', () => {
    const payload = { email: 'alice@example.com' }
    assert.throws(() => verifyToken(`${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`, SECRET), /invalid algorithm/)
    assert.throws(() => verifyToken(forge({ alg: 'RS256', typ: 'JWT' }, payload), SECRET), /invalid algorithm/)
    assert.throws(() => verifyToken(forge({ alg: 'constructor', typ: 'JWT' }, payload), SECRET), /invalid algorithm/)
    assert.throws(() => verifyToken(`${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.`, SECRET), /jwt signature is required/)
  })

  it('rejects expired and not yet active tokens', () => {
    const now = Math.floor(Date.now() / 1000)
    assert.throws(() => verifyToken(forge({ alg: 'HS256', typ: 'JWT' }, { exp: now - 1 }), SECRET), /jwt expired/)
    assert.throws(() => verifyToken(forge({ alg: 'HS256', typ: 'JWT' }, { exp: 'tomorrow' }), SECRET), /invalid exp value/)
    assert.throws(() => verifyToken(forge({ alg: 'HS256', typ: 'JWT' }, { nbf: now + 60 }), SECRET), /jwt not active/)
    assert.equal(verifyToken(forge({ alg: 'HS256', typ: 'JWT' }, { email: 'a@b.co', exp: now + 60, nbf: now - 60 }), SECRET).email, 'a@b.co')
  })

  it('rejects malformed tokens and missing secrets', () => {
    assert.throws(() => verifyToken('abc.def', SECRET), /jwt malformed/)
    assert.throws(() => verifyToken('a.b.c', SECRET), /invalid token/)
    assert.throws(() => verifyToken(undefined, SECRET), /jwt must be a string/)
    assert.throws(() => verifyToken(legacyTokens.legacy, ''), /secret or public key must be provided/)
    assert.throws(() => signToken({ email: 'a@b.co' }, ''), /secretOrPrivateKey must have a value/)
  })
})
