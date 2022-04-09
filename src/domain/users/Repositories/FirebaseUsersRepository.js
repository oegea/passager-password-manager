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

import UsersRepository from './UsersRepository.js';

export default class FirebaseUsersRepository extends UsersRepository {
    constructor({
        config,
        firebaseUtils
    }) {
        super({})
        this._config = config;
        this._firebaseUtils = firebaseUtils;
    }

    async getUserPublicDetails ({userOperationRequest})  {

        const email = userOperationRequest.getEmail();

        // Load firebase library
        const {db, fireStore} = this._firebaseUtils;
        const {collection, query, where, limit, getDocs} = fireStore;
    
        const collectionRef = collection(db, "userSharingSettings");
        const q = query(collectionRef, where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);
    
        // If email doesn't exists, return false
        if (querySnapshot.docs.length === 0) {
            return null;
        }
    
        // Get the public key of the user
        const publicKey = querySnapshot.docs[0].data().publicKey;
        const uid = querySnapshot.docs[0].id;   
    
        return {
            publicKey,
            uid
        };
    
    }

    async updateUserPublicKey ({userOperationRequest}) {
        // Load firebase library
        const {db, fireStore} = this._firebaseUtils;
        const {setDoc, doc} = fireStore;

        // Retrieve data
        const uid = userOperationRequest.getUid();
        const publicKey = userOperationRequest.getPublicKey();
        const email = userOperationRequest.getEmail();
        
        const docRef = doc(db, "userSharingSettings", uid);
        await setDoc(docRef, {email, publicKey});
    }
}