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

export default class FirebaseFoldersRepository extends FoldersRepository {
    constructor({
        config,
        firebaseUtils,
        fromResultToFolderEntityMapper
    }) {
        super({})
        this._config = config;
        this._firebaseUtils = firebaseUtils;
        this._fromResultToFolderEntityMapper = fromResultToFolderEntityMapper;
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
        const {db, fireStore} = this._firebaseUtils;
        const {addDoc, collection} = fireStore;

        // Create folder in the database
        const collectionRef = collection(db, "folders");
        const result = await addDoc(collectionRef, {name, key, owner});

        return result;
    }

    async editFolder({folderOperationRequest}) {
        // Retrieve data
        const {db, fireStore} = this._firebaseUtils;
        const {updateDoc, collection, doc} = fireStore;

        const folderId = folderOperationRequest.getId();
        const name = folderOperationRequest.getName();

        const collectionRef = collection(db, "folders");
        const docRef = doc(collectionRef, folderId);
        const result = await updateDoc(docRef, {
            name
        });
        return result;
    }
}