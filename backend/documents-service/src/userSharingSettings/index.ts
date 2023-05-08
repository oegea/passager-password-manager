import { NativeEventBusRepository } from '@useful-tools/docky-documents-service/dist'

const USER_SHARING_SETTINGS_COLLECTION_NAME = 'userSharingSettings'
const USER_SHARING_SETTINGS_FIELDS = ['id', 'email', 'publicKey']
const eventBusRepository = new NativeEventBusRepository()
export const createDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    payload
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME) { return currentResult }

  if (payload.email !== currentUserId) {
    console.log('Trying to create userSharingSettings record with a different email than the authorized session')
    return false
  }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = USER_SHARING_SETTINGS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to create userSharingSettings record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => USER_SHARING_SETTINGS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to create userSharingSettings record with extra fields')
    return false
  }

  // Check if user already exists and if so, return false
  const existingDocuments = await eventBusRepository.query('FIND_DOCUMENT', {
    collection,
    criteria: {
      email: currentUserId
    }
  })

  if (Array.isArray(existingDocuments) && existingDocuments[0]?.length > 0) {
    console.log('Trying to create userSharingSettings record that already exists')
    return false
  }

  return true
}

export const deleteDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME) { return currentResult }

  return false
}

export const findDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    payload
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME) { return currentResult }

  if (typeof payload.email !== 'string' || payload.email.length === 0) { return false }

  return true
}

export const getDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME) { return currentResult }

  return true
}

export const patchDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    id,
    payload
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME) { return currentResult }

  // Check if it is our user
  const existingDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection,
    id
  })

  if (existingDocument[0]?.email !== currentUserId) { return false }

  if (payload.email !== currentUserId) { return false }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = USER_SHARING_SETTINGS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to update userSharingSettings record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => USER_SHARING_SETTINGS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to update userSharingSettings record with extra fields')
    return false
  }

  return true
}
