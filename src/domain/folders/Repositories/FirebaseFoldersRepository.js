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
        firebaseUtils
    }) {
        super({})
        this._config = config;
        this._firebaseUtils = firebaseUtils;
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

    async subscribeToFolders({
        folderSubscriptionRequest
    }){
        const {collectIdsAndDocs, db, fireStore} = this._firebaseUtils;
        const {collection, onSnapshot, query, where, limit} = fireStore;

        const userId = folderSubscriptionRequest.getUserId();
        const onSubscriptionChanges = folderSubscriptionRequest.getOnSubscriptionChanges();

        const collectionRef = collection(db, "folders");
        const q = query(collectionRef, where("owner", "==", userId), limit(25));
        const subscription = onSnapshot(q, (snapshot) => {
            const folders = snapshot.docs.map(collectIdsAndDocs).map(this._parseSharedWithParam);
            
            onSubscriptionChanges(folders);
        });

        return subscription;
    }

    async subscribeToSharedFolders({
        folderSubscriptionRequest
    }){
        const {collectIdsAndDocs, db, fireStore} = this._firebaseUtils;
        const {collection, onSnapshot, query, limit} = fireStore;

        const userId = folderSubscriptionRequest.getUserId();
        const onSubscriptionChanges = folderSubscriptionRequest.getOnSubscriptionChanges();

        const collectionRef = collection(db, "userSharingSettings", userId, "sharedFolders");
        const q = query(collectionRef, limit(25));
        const subscription = onSnapshot(q, (snapshot) => {
            const folders = snapshot.docs.map(collectIdsAndDocs);
            
            onSubscriptionChanges(folders);
        });

        return subscription;
    }

    _parseSharedWithParam (folder) {
        try {
            folder.sharedWith = JSON.parse(folder.sharedWith);
        } catch (error) {
            folder.sharedWith = [];
        }
        
        return folder;
    }

    async shareFolder({userPublicDetails, folderShareRequest}){
        // Load firebase library
        const {db, fireStore} = this._firebaseUtils;
        const {doc, updateDoc, setDoc} = fireStore;

        const {uid} = userPublicDetails;
        const folderName = folderShareRequest.getFolderName();
        const encryptedFolderKey = folderShareRequest.getEncryptedFolderKey();
        const folderId = folderShareRequest.getFolderId();
        const email = folderShareRequest.getEmail();
        const emailList = folderShareRequest.getEmailList();

        // Create a new document inside sharedFolders
        const sharedFolder = {
            name: folderName,
            key: encryptedFolderKey,
            shared: true
        }
        const sharedFolderRef = doc(db, "userSharingSettings", uid, "sharedFolders", folderId);
        await setDoc(
            sharedFolderRef, 
            sharedFolder
        );
        
        // If email exists, add email to the email list
        emailList.push(email);

        // Save the new email list updating the folder in firebase
        const folderRef = doc(db, "folders", folderId);
        await updateDoc(folderRef, {
            sharedWith: JSON.stringify(emailList)
        }); 
        return true;
    }

    async updateFolderSharedWith({folderShareRequest}){
        // Load firebase library
        const {db, fireStore} = this._firebaseUtils;
        const {doc, updateDoc} = fireStore;

        const folderId = folderShareRequest.getFolderId();
        const emailList = folderShareRequest.getEmailList();

        // Save the new email list updating the folder in firebase
        const folderRef = doc(db, "folders", folderId);

        await updateDoc(folderRef, {
            sharedWith: JSON.stringify(emailList)
        });
    }

    async unshareFolder({folderShareRequest, userPublicDetails}){
        // Load firebase library
        const {db, fireStore} = this._firebaseUtils;
        const {doc, deleteDoc} = fireStore;

        const {uid} = userPublicDetails;
        const folderId = folderShareRequest.getFolderId();

        // Remove the folder from the user's shared folders
        const docRef = doc(db, "userSharingSettings", uid, "sharedFolders", folderId);

        await deleteDoc(docRef);
    }

}