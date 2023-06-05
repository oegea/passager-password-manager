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
    deleteDocument,
    deleteSubdocument,
    findDocument, 
    findSubdocument,
    getDocument, 
    retrieveServiceData, 
    setDocument, 
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
            console.log(decodedJwtToken);
            // Retrieve all folders
            const folders = await findDocument('folders', {
                owner: decodedJwtToken.email
            });
            onSubscriptionChanges(folders);
        };
            
        BackendFoldersRepository.foldersSubscription();
        return () => BackendFoldersRepository.foldersSubscription = null;
    }

    async subscribeToSharedFolders() {
        // Not available in local mode
        return () => null; // eslint-disable-line
    }

    _parseSharedWithParam(folder) {
        try {
            folder.sharedWith = JSON.parse(folder.sharedWith);
        } catch (error) {
            folder.sharedWith = [];
        }

        return folder;
    }

    async shareFolder() {
        // Not available in local mode
        return true;
    }

    async updateFolderSharedWith() {
        // Not available in local mode
    }

    async unshareFolder() {
        // Not available in local mode
    }
}
