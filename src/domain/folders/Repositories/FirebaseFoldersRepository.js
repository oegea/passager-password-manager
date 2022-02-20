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

    /**
     * Edits name of an existing folder
     * @param {FolderOperationRequest} folderOperationRequest Details to edit the folder 
     * @returns Reference to the edited folder
     */
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

    /**
     * Deletes a folder
     * @param {FolderReferenceRequest} folderReferenceRequest Reference to the folder id 
     */
    async deleteFolder({folderReferenceRequest}) {
        const {db, fireStore} = this._firebaseUtils;
        const {deleteDoc, doc} = fireStore;

        const folderId = folderReferenceRequest.getId();
        const docRef = doc(db, "folders", folderId);
        deleteDoc(docRef);
    } 

    /**
     * Deletes all passwords from a folder
     * @param {FolderReferenceRequest} folderReferenceRequest Reference to the folder id 
     */
    async deleteFolderRelatedPasswords({folderReferenceRequest}) {
        const {db, fireStore} = this._firebaseUtils;
        const {collection, limit, query, getDocs, writeBatch} = fireStore;

        const folderId = folderReferenceRequest.getId();
        const MAX_ITERATIONS = 1000;
        const DOCS_PER_ITERATION = 10;
    
        // Iteration
        for (let i = 0; i < MAX_ITERATIONS; i += 1){
            // Check if there are still existing passwords on this folder
            const q = query(collection(db, "folders", folderId, "passwords"), limit(DOCS_PER_ITERATION));
            const querySnapshot = await getDocs(q);
            
            // Delete each of them
            const batch = writeBatch(db);
            querySnapshot.docs.forEach(doc => batch.delete(doc.ref))
            await batch.commit();
    
            // If this was the last iteration
            if (querySnapshot.docs.length < DOCS_PER_ITERATION)
                break;
    
            if ( i === MAX_ITERATIONS - 1)
                throw new Error('Too many passwords to delete');
        }
    }
}