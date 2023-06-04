import { 
    createDocument as createUserDocument,
    deleteDocument as deleteUserDocument,
    findDocument as findUserDocument,
    getDocument as getUserDocument,
    patchDocument as patchUserDocument
} from './users'

import {
    createDocument as createSharingSettingsDocument,
    deleteDocument as deleteSharingSettingsDocument,
    findDocument as findSharingSettingsDocument,
    getDocument as getSharingSettingsDocument,
    patchDocument as patchSharingSettingsDocument
} from './userSharingSettings'

import {
    createSubDocument as createSharedFolderSubDocument,
    deleteSubDocument as deleteSharedFolderSubDocument,
    findSubDocument as findSharedFolderSubDocument,
    getSubDocument as getSharedFolderSubDocument,
    patchSubDocument as patchSharedFolderSubDocument
} from './userSharingSettings/sharedFolders'

import {
    createDocument as createFolderDocument,
    deleteDocument as deleteFolderDocument,
    findDocument as findFolderDocument,
    getDocument as getFolderDocument,
    patchDocument as patchFolderDocument
} from './folders'

import {
    createSubDocument as createPasswordSubDocument,
    deleteSubDocument as deletePasswordSubDocument,
    findSubDocument as findPasswordSubDocument,
    getSubDocument as getPasswordSubDocument,
    patchSubDocument as patchPasswordSubDocument
} from './folders/passwords'

const hasPermissions = async (operationType: string, payloadObject: any) => {
    let result = false
    switch(operationType){
        case 'create_document':
            result = await createUserDocument(result, payloadObject)
            result = await createSharingSettingsDocument(result, payloadObject)
            result = await createFolderDocument(result, payloadObject)
            break
        
        case 'create_subdocument':
            result = await createPasswordSubDocument(result, payloadObject)
            result = await createSharedFolderSubDocument(result, payloadObject)
            break
        
        case 'delete_document':
            result = await deleteUserDocument(result, payloadObject)
            result = await deleteSharingSettingsDocument(result, payloadObject)
            result = await deleteFolderDocument(result, payloadObject)
            break
        
        case 'delete_subdocument':
            result = await deletePasswordSubDocument(result, payloadObject)
            result = await deleteSharedFolderSubDocument(result, payloadObject)
            break

        case 'find_document':
            result = await findUserDocument(result, payloadObject)
            result = await findSharingSettingsDocument(result, payloadObject)
            result = await findFolderDocument(result, payloadObject)
            break
        
        case 'find_subdocument':
            result = await findPasswordSubDocument(result, payloadObject)
            result = await findSharedFolderSubDocument(result, payloadObject)
            break

        case 'get_document':
            result = await getUserDocument(result, payloadObject)
            result = await getSharingSettingsDocument(result, payloadObject)
            result = await getFolderDocument(result, payloadObject)
            break

        case 'get_subdocument':
            result = await getPasswordSubDocument(result, payloadObject)
            result = await getSharedFolderSubDocument(result, payloadObject)
            break

        case 'patch_document':
            result = await patchUserDocument(result, payloadObject)
            result = await patchSharingSettingsDocument(result, payloadObject)
            result = await patchFolderDocument(result, payloadObject)
            break

        case 'patch_subdocument':
            result = await patchPasswordSubDocument(result, payloadObject)
            result = await patchSharedFolderSubDocument(result, payloadObject)
            break
    }
    return result
}

export const onGetOperationPermissions = async (type: string, name: string, payloadObject: any) => {
    try {
        const {
            currentUserId,
            operationType
        } = payloadObject

        if (currentUserId === null) {
            console.log('Trying to query without being logged in')
            return false
        }
        
        const result = await hasPermissions(operationType, payloadObject)
        return result

    } catch (error) {
        console.error(error)
        return false
    }
}