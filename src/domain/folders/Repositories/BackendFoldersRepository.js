/**
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 *
 * Copyright (C) 2022 Oriol Egea Carvajal
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import FoldersRepository from './FoldersRepository.js';
import { 
    createDocument, 
    createSubdocument, 
    deleteDocument,
    deleteSubdocument,
    findDocument, 
    findSubdocument,
    getDocument, 
    retrieveServiceData, 
    setDocument, 
    setSubdocument,
    updateDocument
} from '../../../libs/backend.js';


export default class BackendFoldersRepository extends FoldersRepository {
    constructor({ config }) {
        super({});
        this._config = config;
    }

    static foldersSubscription = null;

    /**
     * Creates a folder in firebase and returns a FolderEntity
     * @param {FolderOperationRequest} folderOperationRequest Request with data to create the folder
     * @returns FolderEntity that represents the new folder
     */
    async createFolder({ folderOperationRequest }) {
        // Retrieve data
        const name = folderOperationRequest.getName();
        const owner = folderOperationRequest.getOwner();
        const key = folderOperationRequest.getFolderKey();

        // Create folder in the database
        const result = await createDocument('folders', {
            name,
            key,
            owner,
        });

        BackendFoldersRepository.foldersSubscription();

        return result;
    }

    /**
     * Edits name of an existing folder
     * @param {FolderOperationRequest} folderOperationRequest Details to edit the folder
     * @returns Reference to the edited folder
     */
    async editFolder({ folderOperationRequest }) {
        const folderId = folderOperationRequest.getId();
        const name = folderOperationRequest.getName();

        const result = await updateDocument('folders', folderId, {
            name
        });

        BackendFoldersRepository.foldersSubscription();
        return result;
    }

    /**
     * Deletes a folder
     * @param {FolderReferenceRequest} folderReferenceRequest Reference to the folder id
     */
    async deleteFolder({ folderReferenceRequest }) {
        const folderId = folderReferenceRequest.getId();
        await deleteDocument('folders', folderId);
        BackendFoldersRepository.foldersSubscription();
    }

    /**
     * Deletes all passwords from a folder
     * @param {FolderReferenceRequest} folderReferenceRequest Reference to the folder id
     */
    async deleteFolderRelatedPasswords({ folderReferenceRequest }) {
        const folderId = folderReferenceRequest.getId();

        // Check if there are still existing passwords on this folder
        const passwords = await findSubdocument('folders', folderId, 'passwords', {});

        // Delete each of them
        for (const password of passwords) {
            await deleteSubdocument('folders', folderId, 'passwords', password.id);
        }
    }  

    async subscribeToFolders({ folderSubscriptionRequest }) {

        const onSubscriptionChanges =
            folderSubscriptionRequest.getOnSubscriptionChanges();

        BackendFoldersRepository.foldersSubscription = async () => {
            const {decodedJwtToken} = retrieveServiceData();
            // Retrieve all folders
            const folders = await findDocument('folders', {
                owner: decodedJwtToken.email
            });
            onSubscriptionChanges(folders);
        };
            
        BackendFoldersRepository.foldersSubscription();
        return () => BackendFoldersRepository.foldersSubscription = null;
    }

    async subscribeToSharedFolders({ folderSubscriptionRequest }) {
        const userId = folderSubscriptionRequest.getUserId();
        const onSubscriptionChanges =
            folderSubscriptionRequest.getOnSubscriptionChanges();

        // Retrieve current userSharingSettings
        const userSharingSettings = await findDocument('userSharingSettings', {
            email: userId
        });

        // Retrieve all shared folders
        const sharedFolders = await findSubdocument('userSharingSettings', userSharingSettings[0].id, 'sharedFolders', {});

        onSubscriptionChanges(sharedFolders);

        // Real-time updates not available
        return () => null; // eslint-disable-line
    }

    async shareFolder({ userPublicDetails, folderShareRequest }) {
        const { uid } = userPublicDetails;
        const folderName = folderShareRequest.getFolderName();
        const encryptedFolderKey = folderShareRequest.getEncryptedFolderKey();
        const folderId = folderShareRequest.getFolderId();
        const email = folderShareRequest.getEmail();
        const emailList = folderShareRequest.getEmailList();

        // Recover the userSharingSettings document
        const userSharingSettings = await findDocument('userSharingSettings', {
            email
        });

        // Create a new document inside sharedFolders subcollection
        const sharedFolder = {
            name: folderName,
            key: encryptedFolderKey,
            shared: true,
            folder: folderId,
        };

        await createSubdocument('userSharingSettings', userSharingSettings[0].id, 'sharedFolders', sharedFolder);
        
        // Add email to the shared list
        emailList.push(email);

        await updateDocument('folders', folderId, {
            sharedWith: emailList,
        });

        BackendFoldersRepository.foldersSubscription();

        return true;
    }

    async updateFolderSharedWith({ folderShareRequest }) {
        // Load firebase library
        const folderId = folderShareRequest.getFolderId();
        const emailList = folderShareRequest.getEmailList();

        // Save the new email list updating the folder in firebase
        await updateDocument('folders', folderId, {
            sharedWith: emailList,
        });

        BackendFoldersRepository.foldersSubscription();
    }

    async unshareFolder({ folderShareRequest, userPublicDetails }) {
        // Load firebase library
        const { uid } = userPublicDetails;
        const folderId = folderShareRequest.getFolderId();

        // Recover the userSharingSettings document
        const userSharingSettings = await findDocument('userSharingSettings', {
            email: uid
        });

        // Recover the sharedFolder document
        const sharedFolder = await findSubdocument('userSharingSettings', userSharingSettings[0].id, 'sharedFolders', {
            folder: folderId
        });

        await deleteSubdocument('userSharingSettings', userSharingSettings[0].id, 'sharedFolders', sharedFolder[0].id);
    }
}
