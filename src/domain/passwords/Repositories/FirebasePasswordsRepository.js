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

import {PasswordsRepository} from './PasswordsRepository.js';

export class FirebasePasswordsRepository extends PasswordsRepository {
    constructor({
        config,
        firebaseUtils
    }){
        super({});
        this._config = config;
        this._firebaseUtils = firebaseUtils;
    }

    async createPassword({passwordOperationRequest}){
        const {db, fireStore} = this._firebaseUtils;
        const {collection, addDoc} = fireStore;

        const name = passwordOperationRequest.getName();
        const owner = passwordOperationRequest.getOwner();
        const password = passwordOperationRequest.getPassword();
        const url = passwordOperationRequest.getUrl();
        const username = passwordOperationRequest.getUsername();
        const folderId = passwordOperationRequest.getFolderId();

        const subcollectionRef = collection(db, "folders", folderId, "passwords");

        let docRef = await addDoc(subcollectionRef, {
            name,
            owner,
            password,
            url,
            username
        });
        return docRef;
    }

    async deletePassword({passwordReferenceRequest}){
        const {db, fireStore} = this._firebaseUtils;
        const {doc, deleteDoc} = fireStore;

        const folderId = passwordReferenceRequest.getFolderId();
        const passwordId = passwordReferenceRequest.getPasswordId();

        const docRef = doc(db, "folders", folderId, "passwords", passwordId);
        await deleteDoc(docRef);
    }

    async editPassword({passwordOperationRequest}){
        const {db, fireStore} = this._firebaseUtils;
        const {doc, updateDoc} = fireStore;

        const name = passwordOperationRequest.getName();
        const password = passwordOperationRequest.getPassword();
        const passwordId = passwordOperationRequest.getPasswordId();
        const url = passwordOperationRequest.getUrl();
        const username = passwordOperationRequest.getUsername();
        const folderId = passwordOperationRequest.getFolderId();

        const docRef = doc(db, "folders", folderId, "passwords", passwordId);
        await updateDoc(docRef, {
            name,
            password,
            url,
            username
        });
    }
}