import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'
import { ObjectId } from 'mongodb'
import { verifyToken } from '../../shared/jwt.js'
import { createFakeMongo } from '../../shared/testing/fakeMongo.js'
import { startFakeSmtp } from '../../shared/testing/fakeSmtp.js'
import { createNormalizer, request } from '../../shared/testing/httpClient.js'
import { createAuthenticationApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import { sendEmail } from '../src/emailSender.js'
import { groups, runGroup } from './scenario.js'

// What the original service answered and e-mailed
const golden = JSON.parse(readFileSync(new URL('./golden.json', import.meta.url), 'utf8'))

const SECRET = 'passager-test-secret'
const CONFIGURABLE_VARIABLES = [
  'AUTH_LIMIT_ACCESS_BY_EMAIL',
  'AUTH_ALLOWED_DOMAINS',
  'AUTH_ALLOWED_EMAILS',
  'AUTH_LIMIT_ATTEMPTS_PER_IP',
  'AUTH_LIMIT_ATTEMPTS_PER_IP_WAIT_TIME',
  'HTML_EMAIL_TEMPLATE'
]

const silenced = async (callback) => {
  const originalError = console.error
  console.error = () => {}
  try {
    return await callback()
  } finally {
    console.error = originalError
  }
}

describe('authentication service', () => {
  let smtp
  const tokens = []
  const resultsByGroup = []

  const configure = (env) => {
    for (const name of CONFIGURABLE_VARIABLES) delete process.env[name]
    Object.assign(process.env, {
      COMMON_APP_NAME: 'Passager',
      COMMON_ORGANIZATION_NAME: 'Test Org',
      COMMON_TOKEN_SECRET: SECRET,
      AUTH_COLLECTION: 'emailVerification',
      AUTH_SMTP_HOST: '127.0.0.1',
      AUTH_SMTP_PORT: String(smtp.server.address().port),
      AUTH_SMTP_USER: 'user',
      AUTH_SMTP_PASSWORD: 'password',
      AUTH_SMTP_SENDER: 'passager@example.com',
      ...env
    })
    loadConfig()
  }

  const startService = async (env) => {
    configure(env)
    const { getCollection } = createFakeMongo(() => new ObjectId())
    const server = await createAuthenticationApp({ getCollection, sendEmail, waitTime: 0 }).listen(0, '127.0.0.1')
    return { server, port: server.address().port, getCollection }
  }

  const takeMails = async () => smtp.messages.splice(0).map((message) => ({
    from: message.from,
    to: message.to,
    subject: message.subject,
    ...(String(message.contentType).startsWith('text/html') ? { html: message.body.trim() } : { text: message.body })
  }))

  before(async () => {
    smtp = await startFakeSmtp(0)

    for (const group of groups) {
      const { server, port, getCollection } = await startService(group.env)
      try {
        resultsByGroup.push(await silenced(() => runGroup({
          group,
          send: async (parameters) => {
            const response = await request({ port, ...parameters })
            if (response.status === 200 && parameters.path.includes('/validate/')) {
              tokens.push(JSON.parse(response.body).message)
            }
            return response
          },
          normalize: createNormalizer(),
          readCode: async (email) => (await getCollection('emailVerification').findOne({ email }))?.number,
          takeMails
        })))
      } finally {
        server.close()
      }
    }
  })

  after(() => smtp.server.close())

  for (const [groupIndex, expectedGroup] of golden.entries()) {
    describe(expectedGroup.group, () => {
      it('covers the same requests the original service was recorded with', () => {
        assert.equal(groups[groupIndex].name, expectedGroup.group)
        assert.deepEqual(resultsByGroup[groupIndex].map((result) => result.name), expectedGroup.results.map((result) => result.name))
      })

      for (const [index, expected] of expectedGroup.results.entries()) {
        it(`behaves like the original service: ${expected.name}`, () => {
          // Through JSON, as the recorded results were stored
          assert.deepEqual(JSON.parse(JSON.stringify(resultsByGroup[groupIndex][index])), expected)
        })
      }
    })
  }

  it('issues tokens that can be verified with the shared secret', () => {
    assert.equal(tokens.length, 3)
    for (const token of tokens) {
      assert.equal(verifyToken(token, SECRET).email, 'alice@example.com')
    }
  })

  describe('attempts limit by ip address', () => {
    it('is disabled unless it is configured', async () => {
      const { server, port, getCollection } = await startService({})
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          assert.equal((await request({ port, method: 'GET', path: '/login/alice@example.com' })).status, 200)
        }
        assert.equal(await getCollection('ipLimit').findOne({}), null)
      } finally {
        server.close()
        await takeMails()
      }
    })

    it('rejects new attempts once the limit is reached, until the wait time is over', async () => {
      const { server, port, getCollection } = await startService({
        AUTH_LIMIT_ATTEMPTS_PER_IP: '2',
        AUTH_LIMIT_ATTEMPTS_PER_IP_WAIT_TIME: '60000'
      })
      const login = () => request({ port, method: 'GET', path: '/login/alice@example.com', headers: { 'X-Forwarded-For': '203.0.113.7' } })
      try {
        assert.equal((await login()).status, 200)
        assert.equal((await login()).status, 200)

        const rejected = await login()
        assert.equal(rejected.status, 500)
        assert.deepEqual(JSON.parse(rejected.body), { success: false, message: 'StartLoginService: reached limit of attempts by ip' })

        // Other addresses are not affected
        assert.equal((await request({ port, method: 'GET', path: '/login/alice@example.com', headers: { 'X-Forwarded-For': '203.0.113.8' } })).status, 200)

        // Once the wait time is over, attempts are accepted again
        const ipLimit = getCollection('ipLimit')
        const record = await ipLimit.findOne({ ipAddress: '203.0.113.7' })
        assert.equal(record.attempts, 2)
        await ipLimit.updateOne({ ipAddress: '203.0.113.7' }, { $set: { expirationTime: Date.now() - 1 } })
        assert.equal((await login()).status, 200)
      } finally {
        server.close()
        await takeMails()
      }
    })
  })

  it('generates codes of seven digits', async () => {
    const { server, port, getCollection } = await startService({})
    try {
      for (let attempt = 0; attempt < 20; attempt++) {
        await request({ port, method: 'GET', path: '/login/alice@example.com' })
        const { number } = await getCollection('emailVerification').findOne({ email: 'alice@example.com' })
        assert.ok(Number.isInteger(number) && number >= 1000000 && number <= 9999999)
      }
    } finally {
      server.close()
      await takeMails()
    }
  })
})
