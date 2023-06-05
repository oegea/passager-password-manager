import { NativeEventBusRepository } from '@useful-tools/docky-documents-service/dist'

const FOLDERS_COLLECTION_NAME = 'folders'
const PASSWORDS_COLLECTION_NAME = 'passwords'
const PASSWORDS_FIELDS = ['id', 'name', 'owner', 'password', 'url', 'username']
const eventBusRepository = new NativeEventBusRepository()

const _canAccessFolder = async ({
  currentUserId,
  parentId
}: {
  currentUserId: string
  parentId: string
}): Promise<boolean> => {
  // Parent should be a folder owned by currentUserId
  let folderDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection: FOLDERS_COLLECTION_NAME,
    id: parentId
  })
  folderDocument = folderDocument[0]

  if (folderDocument.owner === currentUserId)
    return true

  // Or our userSharingSettings/sharedFolders should contain a record for this folder
  let userSharingSettings = await eventBusRepository.query('FIND_DOCUMENT', {
    collection: 'userSharingSettings',
    criteria: {
      email: currentUserId
    }
  })
  userSharingSettings = userSharingSettings[0][0]

  let sharedFolder = await eventBusRepository.query('FIND_SUBDOCUMENT', {
    collection: 'userSharingSettings',
    parentId: userSharingSettings.id,
    subCollection: 'sharedFolders',
    criteria: {
      folder: parentId
    }
  })
  sharedFolder = sharedFolder[0][0]

  if (!sharedFolder.shared) {
    console.log('Trying to access a folder not owned by nor shared with the current user')
    return false
  }

  return true
}

export const createSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    subCollection,
    parentId,
    payload
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME || subCollection !== PASSWORDS_COLLECTION_NAME) { return currentResult }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = PASSWORDS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to create a password record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => PASSWORDS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to create a password record with extra fields')
    return false
  }

  // Payload.owner must be equal to currentUserId
  if (payload.owner !== currentUserId) {
    console.log('Trying to create a password record with a different email than the authorized session')
    return false
  }

  // Name must be a string with length between 1 and 50
  if (payload.name.length === 0 || payload.name.length > 50) {
    console.log('Trying to create a password record with an invalid name')
    return false
  }

  if (!await _canAccessFolder({ currentUserId, parentId })) { return false }

  return true
}

export const deleteSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    subCollection,
    parentId
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME || subCollection !== PASSWORDS_COLLECTION_NAME) { return currentResult }

  if (!await _canAccessFolder({ currentUserId, parentId })) { return false }

  return true
}

export const findSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    subCollection,
    parentId
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME || subCollection !== PASSWORDS_COLLECTION_NAME) { return currentResult }

  if (!await _canAccessFolder({ currentUserId, parentId })) { return false }

  return true
}

export const getSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    subCollection,
    parentId
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME || subCollection !== PASSWORDS_COLLECTION_NAME) { return currentResult }

  if (!await _canAccessFolder({ currentUserId, parentId })) { return false }

  return true
}

export const patchSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    id,
    subCollection,
    parentId,
    payload
  } = payloadObject

  if (collection !== FOLDERS_COLLECTION_NAME || subCollection !== PASSWORDS_COLLECTION_NAME) { return currentResult }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = PASSWORDS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to update a password record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => PASSWORDS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to update a password record with extra fields')
    return false
  }

  // owner field should not be updated
  let existingRecord = await eventBusRepository.query('GET_SUBDOCUMENT', {
    collection: FOLDERS_COLLECTION_NAME,
    parentId,
    subCollection: PASSWORDS_COLLECTION_NAME,
    id
  })
  existingRecord = existingRecord[0]

  if (payload.owner !== existingRecord.owner) {
    console.log('Trying to update a password record modyfing the owner field')
    return false
  }

  // Name must be a string with length between 1 and 50
  if (payload.name.length === 0 || payload.name.length > 50) {
    console.log('Trying to create a password record with an invalid name')
    return false
  }

  if (!await _canAccessFolder({ currentUserId, parentId })) { return false }

  return true
}
