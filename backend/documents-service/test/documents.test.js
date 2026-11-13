import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'
import { ObjectId } from 'mongodb'
import { signToken } from '../../shared/jwt.js'
import { createFakeMongo } from '../../shared/testing/fakeMongo.js'
import { createNormalizer, request } from '../../shared/testing/httpClient.js'
import { createDocumentsApp } from '../src/app.js'
import { isSafeCriteria } from '../src/documents.js'
import { ALICE, BOB, CAROL, runScenario } from './scenario.js'

const readJson = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'))

// Responses of the original service, and tokens issued with the library it used
const golden = readJson('./golden.json')
const legacyTokens = readJson('./legacyTokens.json')

describe('documents service', () => {
  let server
  let results

  before(async () => {
    process.env.COMMON_TOKEN_SECRET = legacyTokens.secret
    process.env.AUTH_PUBLIC_URL = 'http://localhost:3001/'
    process.env.DOCS_PUBLIC_URL = 'http://localhost:3002/'

    const { getCollection } = createFakeMongo(() => new ObjectId())
    server = await createDocumentsApp({ getCollection }).listen(0, '127.0.0.1')
    const { port } = server.address()

    const session = (email) => signToken({ email }, legacyTokens.secret, { expiresInSeconds: 3600 })
    const [header, payload, signature] = session(ALICE).split('.')
    const tokens = {
      [ALICE]: session(ALICE),
      [BOB]: session(BOB),
      [CAROL]: session(CAROL),
      garbage: 'abc.def',
      expired: signToken({ email: ALICE }, legacyTokens.secret, { expiresInSeconds: -10 }),
      wrongSecret: signToken({ email: ALICE }, 'another-secret', { expiresInSeconds: 3600 }),
      unsigned: `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${payload}.`,
      tampered: `${header}.${Buffer.from(JSON.stringify({ email: BOB })).toString('base64url')}.${signature}`,
      legacy: legacyTokens.legacy,
      legacyHS512: legacyTokens.legacyHS512,
      legacyExpired: legacyTokens.legacyExpired
    }

    // Errors of rejected operations are logged, as they are in production
    const originalLog = console.log
    const originalError = console.error
    console.log = () => {}
    console.error = () => {}
    try {
      results = await runScenario({
        send: (parameters) => request({ port, ...parameters }),
        normalize: createNormalizer(),
        tokens
      })
    } finally {
      console.log = originalLog
      console.error = originalError
    }
  })

  after(() => server.close())

  it('covers the same requests the original service was recorded with', () => {
    assert.deepEqual(results.map((result) => result.name), golden.map((expected) => expected.name))
  })

  for (const [index, expected] of golden.entries()) {
    it(`answers like the original service: ${expected.name}`, () => {
      assert.deepEqual(results[index].response, expected.response)
    })
  }
})

describe('search criteria', () => {
  it('accepts flat equality conditions', () => {
    assert.equal(isSafeCriteria({}), true)
    assert.equal(isSafeCriteria({ email: ALICE, shared: true, count: 1, missing: null }), true)
  })

  it('rejects MongoDB operators and nested conditions', () => {
    assert.equal(isSafeCriteria({ $where: 'return true' }), false)
    assert.equal(isSafeCriteria({ email: { $ne: null } }), false)
    assert.equal(isSafeCriteria({ email: [ALICE] }), false)
    assert.equal(isSafeCriteria([]), false)
    assert.equal(isSafeCriteria(null), false)
    assert.equal(isSafeCriteria('email'), false)
  })
})
