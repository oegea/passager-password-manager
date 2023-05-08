import { NativeEventBusRepository } from '@useful-tools/docky-documents-service/dist'

const FOLDERS_COLLECTION_NAME = 'folders'
const FOLDERS_FIELDS = ['id', 'key', 'name', 'owner']
const eventBusRepository = new NativeEventBusRepository()
export const createDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    payload
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME) { return currentResult }

  if (payload.owner !== currentUserId) {
    console.log('Trying to create a folder record with a different email than the authorized session')
    return false
  }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = FOLDERS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to create a folder record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => FOLDERS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to create a folder record with extra fields')
    return false
  }

  if (payload.name.length === 0 || payload.name.length > 50) {
    console.log('Trying to create a folder record with an invalid name')
    return false
  }

  return true
}

export const deleteDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    id
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME) { return currentResult }

  const existingDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection,
    id
  })

  if (existingDocument[0]?.owner !== currentUserId) { return false }

  return true
}

export const findDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    payload
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME) { return currentResult }

  if (payload.owner !== currentUserId) { return false }

  return true
}

export const getDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    id
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME) { return currentResult }

  const existingDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection,
    id
  })

  if (existingDocument[0]?.owner !== currentUserId) { return false }

  return true
}

export const patchDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    id,
    payload
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME) { return currentResult }

  // Check if it is our user
  const existingDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection,
    id
  })

  if (existingDocument[0]?.owner !== currentUserId) { return false }

  if (payload.owner !== currentUserId) { return false }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = FOLDERS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to update a folder record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => FOLDERS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to update a folder record with extra fields')
    return false
  }

  if (payload.name.length === 0 || payload.name.length > 50) {
    console.log('Trying to create a folder record with an invalid name')
    return false
  }

  return true
}
