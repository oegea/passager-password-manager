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
import { 
    createDocument, 
    findDocument, 
    getDocument, 
    retrieveServiceData, 
    setDocument, 
    updateDocument
} from '../../../libs/backend.js';

export default class BackendUsersRepository extends UsersRepository {
    constructor({ config, userDocumentEntity }) {
        super({});
        this._config = config;
        this._userDocumentEntity = userDocumentEntity;
    }

    async getUserPublicDetails({ userOperationRequest }) {
        const email = userOperationRequest.getEmail();

        const searchResult = await findDocument('userSharingSettings', {
            email
        });

        // If email doesn't exists, return false
        if (searchResult.length === 0) {
            return null;
        }
        // Get the public key of the user
        const publicKey = searchResult[0].publicKey;
        const uid = email;

        return {
            publicKey,
            uid,
        };
    }

    async updateUserPublicKey({ userOperationRequest }) {
        // Retrieve data
        const uid = userOperationRequest.getUid();
        const publicKey = userOperationRequest.getPublicKey();
        const email = userOperationRequest.getEmail();

        const document = {
            publicKey,
            email,
        };

        setDocument('userSharingSettings', document, {
            email: uid
        });
    }

    async getUserDocumentByUid({ userOperationRequest }) {
        // Retrieve uid
        const uid = userOperationRequest.getUid();

        const currentUserDocument = await findDocument('users', {
            email: uid
        });

        if (currentUserDocument === null || currentUserDocument.length === 0)
            return null;
        
        const result = await getDocument('users', currentUserDocument[0].id);
        // If exists, return
        if (result !== null) {
            return {
                ...result,
                uid: result.email
            };
        }

        return null;
    }

    async updateUserDocument({ userOperationRequest, userDocumentEntity }) {
        // Retrieve data
        const uid = userOperationRequest.getUid();
        const userDocument = userDocumentEntity.toJSON();

        // Get current id
        const currentUserDocument = await findDocument('users', {
            email: userDocument.email
        });

        if (currentUserDocument === null || currentUserDocument.length === 0)
            return null;

        // Update user document
        await updateDocument('users', currentUserDocument[0].id, userDocument);
    }

    async subscribeToAuthStateChange({ userSubscriptionRequest }) {

        // Initialize user data if it is not initialized
        const userData = await this._initializeAuthDocument();

        // Retrieve callback function
        const onAuthStateChangedCallback =
            userSubscriptionRequest.getOnSubscriptionChanges();

        // Call
        onAuthStateChangedCallback({
            ...userData,
            uid: userData.email,
        });

        // This is a fake subscription, so return a function that does nothing
        return function () {};
    }

    async _initializeAuthDocument() {
        const userData = retrieveServiceData();
        if (userData === null) 
            return;
        
        const { decodedJwtToken } = userData;

        const currentUserDocument = await findDocument('users', {
            email: decodedJwtToken.email
        });

        if (currentUserDocument === null)
            return;
        
        if (currentUserDocument.length === 0) {
            const user = this._userDocumentEntity({
                email: decodedJwtToken.email,
                displayName: decodedJwtToken.email,
            });
            const userDocument = {
                ...user.toJSON()
            };
            const result = await createDocument('users', userDocument);
            return result;
        }

        return currentUserDocument[0];
    }
}

