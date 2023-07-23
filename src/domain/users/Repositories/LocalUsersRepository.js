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

export default class LocalUsersRepository extends UsersRepository {
    constructor({ config, LocalStorageDatabase, userDocumentEntity }) {
        super({});
        this._config = config;
        this._LocalStorageDatabase = LocalStorageDatabase;
        this._userDocumentEntity = userDocumentEntity;
    }

    async getUserPublicDetails({ userOperationRequest }) {
        const email = userOperationRequest.getEmail();

        const searchResult = this._LocalStorageDatabase.searchDocument(
            'userSharingSettings',
            'email',
            email
        );

        // If email doesn't exists, return false
        if (searchResult.length === 0) {
            return null;
        }

        // Get the public key of the user
        const publicKey = searchResult[0].publicKey;
        const uid = searchResult[0].id;

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
            uid,
            publicKey,
            email,
        };

        this._LocalStorageDatabase.setDocument(
            'userSharingSettings',
            document,
            'uid',
            uid
        );
    }

    async updateUserPrivateKey({ userOperationRequest }) {
        // Retrieve data
        const uid = userOperationRequest.getUid();
        const privateKey = userOperationRequest.getPrivateKey();
        const email = userOperationRequest.getEmail();

        const document = {
            uid,
            privateKey,
            email,
        };

        this._LocalStorageDatabase.setDocument(
            'userSharingSettings',
            document,
            'uid',
            uid
        );
    }

    async getUserDocumentByUid({ userOperationRequest }) {
        // Retrieve uid
        const uid = userOperationRequest.getUid();

        // Retrieve current user document
        const searchResult = this._LocalStorageDatabase.searchDocument(
            'users',
            'uid',
            uid
        );

        // If exists, return
        if (searchResult.length > 0) {
            return searchResult[0];
        }

        return null;
    }

    async updateUserDocument({ userOperationRequest, userDocumentEntity }) {
        // Retrieve data
        const uid = userOperationRequest.getUid();
        const userDocument = userDocumentEntity.toJSON();

        // Update user document
        const document = {
            uid,
            ...userDocument,
        };
        this._LocalStorageDatabase.setDocument('users', document, 'uid', uid);
    }

    async subscribeToAuthStateChange({ userSubscriptionRequest }) {
        // Initialize user data if it is not initialized
        this._initializeAuthDocument();

        // Retrieve callback function
        const onAuthStateChangedCallback =
            userSubscriptionRequest.getOnSubscriptionChanges();

        // Subscribe to auth state change
        const unsubscribe = this._LocalStorageDatabase.subscribeToLocalStorage(
            'auth',
            onAuthStateChangedCallback
        );

        return unsubscribe;
    }

    _initializeAuthDocument() {
        const auth = this._LocalStorageDatabase.getItem('auth');
        if (auth === null) {
            const user = this._userDocumentEntity({
                displayName: 'Local user',
            });
            const userDocument = {
                ...user.toJSON(),
                uid: this._LocalStorageDatabase.getRandomId(),
            };
            this._LocalStorageDatabase.setCollection('auth', userDocument);
        }
    }
}
