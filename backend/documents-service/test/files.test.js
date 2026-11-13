import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { ObjectId } from 'mongodb'
import { signToken } from '../../shared/jwt.js'
import { createFakeMongo } from '../../shared/testing/fakeMongo.js'
import { request } from '../../shared/testing/httpClient.js'
import { createDocumentsApp } from '../src/app.js'
import { FILE_CHUNK_BYTES } from '../src/files/index.js'

const SECRET = 'files-test-secret'
const ALICE = 'alice@example.com'
const BOB = 'bob@example.com'
const CAROL = 'carol@example.com'

describe('file storage', () => {
  let server
  let port
  let mongo
  const tokens = {}
  const state = {}

  const call = async (user, method, path, body) => {
    const response = await request({
      port,
      method,
      path,
      headers: {
        ...(user ? { Authorization: `Bearer ${tokens[user]}` } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    return { status: response.status, ...JSON.parse(response.body) }
  }
  const create = (user, collection, document) => call(user, 'POST', `/documents/${collection}`, document)
  const find = (user, collection, criteria) => call(user, 'POST', `/documents/${collection}/find`, criteria)

  before(async () => {
    process.env.COMMON_TOKEN_SECRET = SECRET
    mongo = createFakeMongo(() => new ObjectId())
    server = await createDocumentsApp({ getCollection: mongo.getCollection }).listen(0, '127.0.0.1')
    port = server.address().port
    for (const user of [ALICE, BOB, CAROL]) {
      tokens[user] = signToken({ email: user }, SECRET, { expiresInSeconds: 3600 })
      const settings = await create(user, 'userSharingSettings', { email: user, publicKey: 'pk' })
      state[user] = settings.message.id
    }
    const folder = await create(ALICE, 'folders', { key: 'k', name: 'Folder', owner: ALICE, sharedWith: [] })
    state.folder = folder.message.id

    console.log = () => {}
    console.error = () => {}
  })

  after(() => server.close())

  it('announces what it can store', async () => {
    const response = await request({ port, method: 'GET', path: '/capabilities' })
    assert.equal(response.status, 200)
    assert.deepEqual(JSON.parse(response.body), {
      files: { maxBytes: 50 * 1024 * 1024, chunkBytes: FILE_CHUNK_BYTES }
    })

    process.env.DOCS_MAX_FILE_BYTES = String(5 * FILE_CHUNK_BYTES)
    const limited = await request({ port, method: 'GET', path: '/capabilities' })
    assert.equal(JSON.parse(limited.body).files.maxBytes, 5 * FILE_CHUNK_BYTES)
    // Pieces beyond the configured size are refused
    const file = await create(ALICE, 'files', { folder: state.folder, owner: ALICE })
    assert.equal((await create(ALICE, 'fileChunks', { file: file.message.id, index: 4, data: 'x' })).success, true)
    assert.equal((await create(ALICE, 'fileChunks', { file: file.message.id, index: 5, data: 'x' })).success, false)
    await call(ALICE, 'DELETE', `/documents/files/${file.message.id}`)
    delete process.env.DOCS_MAX_FILE_BYTES
  })

  it('lets the owner of a folder store a file in pieces', async () => {
    const file = await create(ALICE, 'files', { folder: state.folder, owner: ALICE })
    assert.equal(file.success, true)
    state.file = file.message.id
    assert.deepEqual(Object.keys(file.message).sort(), ['folder', 'id', 'owner'])

    for (const index of [0, 1, 2]) {
      const chunk = await create(ALICE, 'fileChunks', { file: state.file, index, data: `piece-${index}` })
      assert.equal(chunk.success, true)
    }

    const pieces = await find(ALICE, 'fileChunks', { file: state.file })
    assert.deepEqual(pieces.message.map((piece) => piece.data).sort(), ['piece-0', 'piece-1', 'piece-2'])

    const one = await find(ALICE, 'fileChunks', { file: state.file, index: 1 })
    assert.deepEqual(one.message.map((piece) => piece.data), ['piece-1'])

    const listed = await find(ALICE, 'files', { folder: state.folder })
    assert.deepEqual(listed.message.map((item) => item.id), [state.file])
  })

  it('accepts a piece of the announced size in one request', async () => {
    // Encrypted: 28 bytes of overhead, then base64
    const data = 'A'.repeat(Math.ceil(((FILE_CHUNK_BYTES + 28) * 4) / 3))
    const chunk = await create(ALICE, 'fileChunks', { file: state.file, index: 3, data })
    assert.equal(chunk.success, true)
  })

  it('rejects malformed files and pieces', async () => {
    const rejected = [
      await create(ALICE, 'files', { folder: state.folder, owner: BOB }),
      await create(ALICE, 'files', { folder: state.folder, owner: ALICE, extra: 1 }),
      await create(ALICE, 'files', { owner: ALICE }),
      await create(ALICE, 'files', { folder: 'not-an-id', owner: ALICE }),
      await create(ALICE, 'fileChunks', { file: state.file, index: 0, data: 'again' }),
      await create(ALICE, 'fileChunks', { file: state.file, index: -1, data: 'x' }),
      await create(ALICE, 'fileChunks', { file: state.file, index: 1.5, data: 'x' }),
      await create(ALICE, 'fileChunks', { file: state.file, index: 100000, data: 'x' }),
      await create(ALICE, 'fileChunks', { file: state.file, index: 9, data: '' }),
      await create(ALICE, 'fileChunks', { file: state.file, index: 9, data: 'x'.repeat(95000) }),
      await create(ALICE, 'fileChunks', { file: state.file, index: 9, data: 'x', extra: 1 }),
      await create(ALICE, 'fileChunks', { file: 'missing', index: 9, data: 'x' }),
      await create(ALICE, 'fileChunks', { file: new ObjectId().toString(), index: 9, data: 'x' }),
      await find(ALICE, 'fileChunks', {}),
      await find(ALICE, 'fileChunks', { file: state.file, data: 'piece-0' }),
      await find(ALICE, 'fileChunks', { file: { $ne: null } }),
      await find(ALICE, 'files', {}),
      await find(ALICE, 'files', { folder: state.folder, owner: ALICE }),
      await call(ALICE, 'PATCH', `/documents/files/${state.file}`, { folder: state.folder }),
      await call(ALICE, 'PATCH', `/documents/files/${state.file}`, { owner: BOB })
    ]
    for (const [index, response] of rejected.entries()) {
      assert.equal(response.success, false, `request ${index} should be rejected`)
      assert.equal(response.status, 500)
    }
  })

  it('keeps files away from people without access to the folder', async () => {
    const chunkId = (await find(ALICE, 'fileChunks', { file: state.file, index: 0 })).message[0].id
    for (const user of [BOB, null]) {
      const rejected = [
        await create(user, 'files', { folder: state.folder, owner: user }),
        await call(user, 'GET', `/documents/files/${state.file}`),
        await find(user, 'files', { folder: state.folder }),
        await find(user, 'fileChunks', { file: state.file }),
        await call(user, 'GET', `/documents/fileChunks/${chunkId}`),
        await create(user, 'fileChunks', { file: state.file, index: 20, data: 'x' }),
        await call(user, 'DELETE', `/documents/fileChunks/${chunkId}`)
      ]
      for (const [index, response] of rejected.entries()) {
        assert.equal(response.success, false, `request ${index} of ${user} should be rejected`)
      }
      const deletion = await call(user, 'DELETE', `/documents/files/${state.file}`)
      assert.notEqual(deletion.message, true)
    }
    assert.equal((await find(ALICE, 'fileChunks', { file: state.file })).message.length, 4)
  })

  it('gives access to the people the folder is shared with, and only while it is', async () => {
    const share = await call(ALICE, 'POST', `/documents/userSharingSettings/${state[BOB]}/sharedFolders`, {
      name: 'Folder', key: 'k-for-bob', shared: true, folder: state.folder
    })
    assert.equal(share.success, true)

    assert.equal((await call(BOB, 'GET', `/documents/files/${state.file}`)).success, true)
    assert.equal((await find(BOB, 'fileChunks', { file: state.file, index: 2 })).message[0].data, 'piece-2')

    // Bob can add a file of his own to the shared folder, and Alice reads it
    const bobFile = await create(BOB, 'files', { folder: state.folder, owner: BOB })
    assert.equal(bobFile.success, true)
    assert.equal((await create(BOB, 'fileChunks', { file: bobFile.message.id, index: 0, data: 'from-bob' })).success, true)
    assert.equal((await find(ALICE, 'fileChunks', { file: bobFile.message.id })).message[0].data, 'from-bob')

    // Carol still has no access
    assert.equal((await find(CAROL, 'fileChunks', { file: state.file })).success, false)

    await call(ALICE, 'DELETE', `/documents/userSharingSettings/${state[BOB]}/sharedFolders/${share.message.id}`)
    assert.equal((await find(BOB, 'fileChunks', { file: state.file })).success, false)
    // What Bob uploaded himself stays reachable for him, so he can remove it
    assert.equal((await call(BOB, 'DELETE', `/documents/files/${bobFile.message.id}`)).message, true)
  })

  it('removes the pieces together with the file', async () => {
    const deletion = await call(ALICE, 'DELETE', `/documents/files/${state.file}`)
    assert.equal(deletion.message, true)
    const remaining = await mongo.getCollection('fileChunks').find({}).toArray()
    assert.equal(remaining.length, 0)
    assert.equal((await call(ALICE, 'GET', `/documents/files/${state.file}`)).success, false)
  })

  it('does not change how passwords are validated', async () => {
    const withExtraField = await call(ALICE, 'POST', `/documents/folders/${state.folder}/passwords`, {
      name: 'n', owner: ALICE, password: 'p', url: 'passager://file', username: 'u', file: 'x'
    })
    assert.equal(withExtraField.success, false)
    const typed = await call(ALICE, 'POST', `/documents/folders/${state.folder}/passwords`, {
      name: 'n', owner: ALICE, password: '{"v":1,"type":"file"}', url: 'passager://file', username: 'u'
    })
    assert.equal(typed.success, true)
  })
})
