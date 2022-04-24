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

export default class LocalFoldersRepository extends FoldersRepository {
    constructor({
        config,
        LocalStorageDatabase
    }) {
        super({})
        this._config = config;
        this._LocalStorageDatabase = LocalStorageDatabase;
    }

    /**
     * Creates a folder in firebase and returns a FolderEntity
     * @param {FolderOperationRequest} folderOperationRequest Request with data to create the folder 
     * @returns FolderEntity that represents the new folder
     */
    async createFolder({folderOperationRequest}){
        // Retrieve data
        const name = folderOperationRequest.getName();
        const owner = folderOperationRequest.getOwner();
        const key = folderOperationRequest.getFolderKey();

        // Create folder in the database
        const result = this._LocalStorageDatabase.createDocument('folders', {name, key, owner});
        return result;
    }

    /**
     * Edits name of an existing folder
     * @param {FolderOperationRequest} folderOperationRequest Details to edit the folder 
     * @returns Reference to the edited folder
     */
    async editFolder({folderOperationRequest}) {

        const folderId = folderOperationRequest.getId();
        const name = folderOperationRequest.getName();

        const result = this._LocalStorageDatabase.updateDocument('folders', {name}, "id", folderId);

        return result;
    }

    /**
     * Deletes a folder
     * @param {FolderReferenceRequest} folderReferenceRequest Reference to the folder id 
     */
    async deleteFolder({folderReferenceRequest}) {
        const folderId = folderReferenceRequest.getId();
        this._LocalStorageDatabase.deleteDocument('folders', 'id', folderId);
    } 

    /**
     * Deletes all passwords from a folder
     * @param {FolderReferenceRequest} folderReferenceRequest Reference to the folder id 
     */
    async deleteFolderRelatedPasswords({folderReferenceRequest}) {

        const folderId = folderReferenceRequest.getId();

        // Check if there are still existing passwords on this folder
        const querySnapshot = this._LocalStorageDatabase.getCollection(`folders.${folderId}.passwords`);
        
        // Delete each of them
        querySnapshot.forEach(doc => this._LocalStorageDatabase.deleteDocument(`folders.${folderId}.passwords`, "id", doc.id));
        
    }

    async subscribeToFolders({
        folderSubscriptionRequest
    }){
        const onSubscriptionChanges = folderSubscriptionRequest.getOnSubscriptionChanges();

        const subscription = this._LocalStorageDatabase.subscribeToLocalStorage('folders', (records) => {
            const folders = records.map(this._parseSharedWithParam);
            
            onSubscriptionChanges(folders);
        });
        return subscription;
    }

    async subscribeToSharedFolders(){

        // Not available in local mode
        return () => null
    }

    _parseSharedWithParam (folder) {
        try {
            folder.sharedWith = JSON.parse(folder.sharedWith);
        } catch (error) {
            folder.sharedWith = [];
        }
        
        return folder;
    }

    async shareFolder(){
        // Not available in local mode
        return true;
    }

    async updateFolderSharedWith(){
        // Not available in local mode
    }

    async unshareFolder(){
        // Not available in local mode
    }

}