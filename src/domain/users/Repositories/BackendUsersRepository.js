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

export default class BackendUsersRepository extends UsersRepository {
    constructor({ config, LocalStorageDatabase, userDocumentEntity }) {
        super({});
        this._config = config;
        this._LocalStorageDatabase = LocalStorageDatabase;
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

const setDocument = async (collection, document, findCriteria) => {
    // First check if document exists
    const searchResult = await findDocument(collection, findCriteria);

    // If document exists, update it
    if (searchResult !== null && searchResult.length > 0) {
        const existingDocument = searchResult[0];

        const updatedDocument = {
            ...document
        };

        const result = await updateDocument(
            collection,
            existingDocument.id,
            updatedDocument
        );

        return result;
    }

    // If document doesn't exist, create it
    const result = await createDocument(collection, document);

    return result;
};

const createDocument = async (collection, document) => {
    
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}`;
    const method = 'POST';
    const body = {
        ...document
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

const updateDocument = async (collection, id, document) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${id}`;
    const method = 'PATCH';
    const body = {
        ...document
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

const getDocument = async (collection, id) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${id}`;
    const method = 'GET';

    const document = await queryDocumentsService(url, method, jwtToken);

    return document;
};

const findDocument = async (collection, criteria) => {

    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/find`;
    const method = 'POST';
    const body = {
        ...criteria
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

const queryDocumentsService = async (url, method, jwtToken, body) => {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
        },
        body: method === 'GET' ? undefined : JSON.stringify(body),
    });

    const responseJson = await response.json();

    // If success prop is not true, return null
    if (responseJson?.success !== true) {
        return null;
    }

    return responseJson.message;
};

const retrieveServiceData = () => {
    const documentsUrl = localStorage.getItem('documentsUrl');
    const jwtToken = localStorage.getItem('jwtToken');

    // If there is a missing parameter, return null
    if (documentsUrl === null || jwtToken === null) {
        return null;
    }

    // If jwt token is expired
    if (isJwtTokenExpired(jwtToken)) {
        return null;
    }

    const decodedJwtToken = decodeJwt(jwtToken);

    return {
        documentsUrl,
        jwtToken,
        decodedJwtToken
    };
};

const decodeJwt = (jwtToken) => {
    const base64Url = jwtToken.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jwtTokenDecoded = JSON.parse(window.atob(base64));
    return jwtTokenDecoded;
};

const isJwtTokenExpired = (jwtToken) => {
    const jwtTokenDecoded = decodeJwt(jwtToken);
    const expirationDate = new Date(jwtTokenDecoded.exp * 1000);
    const currentDate = new Date();
    return currentDate > expirationDate;
};