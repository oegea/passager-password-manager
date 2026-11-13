/**
 * File storage.
 *
 * Requests are limited to 100 KB, so a file is uploaded in pieces. The
 * frontend encrypts every piece before sending it: this service only sees
 * opaque text.
 *
 * - `files`:      one small document per file: `{ folder, owner }`.
 * - `fileChunks`: one document per piece: `{ file, index, data }`.
 *
 * A file belongs to a folder, and whoever can access the folder (its owner,
 * or the people it is shared with) can access the file. Neither kind of
 * document can be modified once created.
 *
 * Older versions of this service do not know these collections and reject
 * them. The frontend asks `/capabilities` before offering large files.
 */
import { eventBusRepository } from '../eventBus.js'
import { canAccessFolder } from '../folders/passwords.js'

export const FILES_COLLECTION_NAME = 'files'
export const FILE_CHUNKS_COLLECTION_NAME = 'fileChunks'

// Size of the pieces. An encrypted piece is its bytes plus 28 of overhead,
// written in base64: it has to fit in a request (100 KB).
export const FILE_CHUNK_BYTES = 64 * 1024
const MAX_CHUNK_CHARS = Math.ceil(((FILE_CHUNK_BYTES + 64) * 4) / 3) + 16

const DEFAULT_MAX_FILE_BYTES = 50 * 1024 * 1024

/**
 * Largest file that can be stored: 50 MB, or what DOCS_MAX_FILE_BYTES says.
 */
export const getMaxFileBytes = () => {
  const configured = Number(process.env.DOCS_MAX_FILE_BYTES)
  return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_MAX_FILE_BYTES
}

const getMaxChunks = () => Math.ceil(getMaxFileBytes() / FILE_CHUNK_BYTES)

const FILES_FIELDS = ['id', 'folder', 'owner']
const FILE_CHUNKS_FIELDS = ['id', 'file', 'index', 'data']

export const getFileCapabilities = () => ({
  maxBytes: getMaxFileBytes(),
  chunkBytes: FILE_CHUNK_BYTES
})

const hasExactFields = (payload, fields) => {
  const receivedFields = Object.keys(payload)
  return fields.every((field) => receivedFields.includes(field)) &&
    receivedFields.every((field) => fields.includes(field))
}

const isNonEmptyString = (value) => typeof value === 'string' && value.length > 0

const isChunkIndex = (value) => Number.isInteger(value) && value >= 0 && value < getMaxChunks()

const getFile = async (id) => {
  if (!isNonEmptyString(id)) { return null }
  const result = await eventBusRepository.query('GET_DOCUMENT', {
    collection: FILES_COLLECTION_NAME,
    id
  })
  return result?.[0] ?? null
}

/**
 * Who uploaded a file can always reach it (so it can be removed even if the
 * folder is gone); otherwise access to its folder is required.
 */
const canAccessFile = async ({ currentUserId, file }) => {
  if (file === null) { return false }
  if (file.owner === currentUserId) { return true }
  return await canAccessFolder({ currentUserId, parentId: file.folder })
}

export const createDocument = async (currentResult, payloadObject) => {
  const { collection, currentUserId, payload } = payloadObject

  if (collection === FILES_COLLECTION_NAME) {
    if (!hasExactFields(payload, FILES_FIELDS)) {
      console.log('Trying to create a file record with unexpected fields')
      return false
    }
    if (payload.owner !== currentUserId) {
      console.log('Trying to create a file record with a different email than the authorized session')
      return false
    }
    if (!isNonEmptyString(payload.folder)) { return false }

    return await canAccessFolder({ currentUserId, parentId: payload.folder })
  }

  if (collection === FILE_CHUNKS_COLLECTION_NAME) {
    if (!hasExactFields(payload, FILE_CHUNKS_FIELDS)) {
      console.log('Trying to create a file chunk with unexpected fields')
      return false
    }
    if (!isNonEmptyString(payload.file) || !isChunkIndex(payload.index)) { return false }
    if (!isNonEmptyString(payload.data) || payload.data.length > MAX_CHUNK_CHARS) {
      console.log('Trying to create a file chunk with an invalid size')
      return false
    }

    const file = await getFile(payload.file)
    if (!await canAccessFile({ currentUserId, file })) { return false }

    // A piece can only be written once
    const existing = await eventBusRepository.query('FIND_DOCUMENT', {
      collection: FILE_CHUNKS_COLLECTION_NAME,
      criteria: { file: payload.file, index: payload.index }
    })
    if (!Array.isArray(existing?.[0]) || existing[0].length > 0) {
      console.log('Trying to create a file chunk that already exists')
      return false
    }

    return true
  }

  return currentResult
}

export const getDocument = async (currentResult, payloadObject) => {
  const { collection, currentUserId, id } = payloadObject

  if (collection === FILES_COLLECTION_NAME) {
    return await canAccessFile({ currentUserId, file: await getFile(id) })
  }

  if (collection === FILE_CHUNKS_COLLECTION_NAME) {
    const chunk = await eventBusRepository.query('GET_DOCUMENT', {
      collection: FILE_CHUNKS_COLLECTION_NAME,
      id
    })
    return await canAccessFile({ currentUserId, file: await getFile(chunk?.[0]?.file) })
  }

  return currentResult
}

// Deleting requires the same access as reading
export const deleteDocument = getDocument

export const findDocument = async (currentResult, payloadObject) => {
  const { collection, currentUserId, payload } = payloadObject

  if (collection === FILES_COLLECTION_NAME) {
    const keys = Object.keys(payload ?? {})
    if (keys.length !== 1 || !isNonEmptyString(payload.folder)) { return false }
    return await canAccessFolder({ currentUserId, parentId: payload.folder })
  }

  if (collection === FILE_CHUNKS_COLLECTION_NAME) {
    const keys = Object.keys(payload ?? {})
    if (!keys.every((key) => key === 'file' || key === 'index')) { return false }
    if (!isNonEmptyString(payload.file)) { return false }
    if (payload.index !== undefined && !isChunkIndex(payload.index)) { return false }
    return await canAccessFile({ currentUserId, file: await getFile(payload.file) })
  }

  return currentResult
}

export const patchDocument = async (currentResult, payloadObject) => {
  const { collection } = payloadObject

  if (collection === FILES_COLLECTION_NAME || collection === FILE_CHUNKS_COLLECTION_NAME) {
    return false
  }

  return currentResult
}
