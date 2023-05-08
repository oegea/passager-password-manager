import { NativeEventBusRepository } from '@useful-tools/docky-documents-service/dist'

const USER_SHARING_SETTINGS_COLLECTION_NAME = 'userSharingSettings'
const SHARED_FOLDERS_COLLECTION_NAME = 'sharedFolders'
const SHARED_FOLDERS_FIELDS = ['id', 'name', 'key', 'shared', 'folder']
const eventBusRepository = new NativeEventBusRepository()

const _canAccessUserSharingSettings = async ({
  currentUserId,
  parentId
}: {
  currentUserId: string
  parentId: string
}): Promise<boolean> => {
  // get parent userSharingSettings record
  let userSharingSettings = await eventBusRepository.query('GET_DOCUMENT', {
    collection: USER_SHARING_SETTINGS_COLLECTION_NAME,
    id: parentId
  })
  userSharingSettings = userSharingSettings[0]

  if (userSharingSettings.email !== currentUserId) {
    console.log('Trying to get subdocuments from a userSharingSettings record that does not belong to the current user')
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

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME || subCollection !== SHARED_FOLDERS_COLLECTION_NAME) { return currentResult }

  // Check that it has the expected fields: Iterate payload keys
  const receivedFields = Object.keys(payload)
  const hasAllFields = SHARED_FOLDERS_FIELDS.every((field) => receivedFields.includes(field))
  if (!hasAllFields) {
    console.log('Trying to create a shared folder record with missing fields')
    return false
  }

  // No other fields are allowed
  const hasOnlyAllowedFields = receivedFields.every((field) => SHARED_FOLDERS_FIELDS.includes(field))
  if (!hasOnlyAllowedFields) {
    console.log('Trying to create a shared folder record with extra fields')
    return false
  }

  // Get the folder
  let folderDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection: 'folders',
    id: payload.folder
  })
  folderDocument = folderDocument[0]

  // If we are not the owner then we cannot create it
  if (folderDocument.owner !== currentUserId) {
    console.log('Trying to create a shared folder with a folder that does not belong to the current user')
    return false
  }

  // We cannot share a folder with ourselves
  let userSharingSettings = await eventBusRepository.query('GET_DOCUMENT', {
    collection: USER_SHARING_SETTINGS_COLLECTION_NAME,
    id: parentId
  })
  userSharingSettings = userSharingSettings[0]

  if (userSharingSettings.email === currentUserId) {
    console.log('Trying to share a folder with current user')
    return false
  }

  // Check if the folder is already shared with the user
  let alreadySharedFolder = await eventBusRepository.query('FIND_SUBDOCUMENT', {
    collection: USER_SHARING_SETTINGS_COLLECTION_NAME,
    parentId,
    subCollection: SHARED_FOLDERS_COLLECTION_NAME,
    criteria: {
      folder: payload.folder
    }
  })
  alreadySharedFolder = alreadySharedFolder[0]

  if (alreadySharedFolder.length > 0) {
    console.log('Trying to share a folder that is already shared with the user')
    return false
  }

  return true
}

export const deleteSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    id,
    subCollection,
    parentId
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME || subCollection !== SHARED_FOLDERS_COLLECTION_NAME) { return currentResult }

  // Get the subdocument
  let sharedFolder = await eventBusRepository.query('GET_SUBDOCUMENT', {
    collection: USER_SHARING_SETTINGS_COLLECTION_NAME,
    parentId,
    subCollection: SHARED_FOLDERS_COLLECTION_NAME,
    id
  })
  sharedFolder = sharedFolder[0]

  const { folder } = sharedFolder
  // Get the folder
  let folderDocument = await eventBusRepository.query('GET_DOCUMENT', {
    collection: 'folders',
    id: folder
  })
  folderDocument = folderDocument[0]

  // If we are not the owner then we cannot delete it
  if (folderDocument.owner !== currentUserId) {
    console.log('Trying to delete a shared folder that does not belong to the current user')
    return false
  }

  return true
}

export const findSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    subCollection,
    parentId
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME || subCollection !== SHARED_FOLDERS_COLLECTION_NAME) { return currentResult }

  if (!await _canAccessUserSharingSettings({ currentUserId, parentId })) { return false }

  return true
}

export const getSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    currentUserId,
    subCollection,
    parentId
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME || subCollection !== SHARED_FOLDERS_COLLECTION_NAME) { return currentResult }

  if (!await _canAccessUserSharingSettings({ currentUserId, parentId })) { return false }

  return true
}

export const patchSubDocument = async (currentResult: boolean, payloadObject: any): Promise<boolean> => {
  const {
    collection,
    subCollection
  } = payloadObject

  if (collection !== USER_SHARING_SETTINGS_COLLECTION_NAME || subCollection !== SHARED_FOLDERS_COLLECTION_NAME) { return currentResult }

  return false
}
