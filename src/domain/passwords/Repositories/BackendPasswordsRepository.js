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

import { PasswordsRepository } from './PasswordsRepository.js';
import { 
    createDocument, 
    createSubdocument, 
    deleteDocument,
    deleteSubdocument,
    findDocument, 
    findSubdocument,
    getDocument, 
    retrieveServiceData, 
    setDocument, 
    setSubdocument,
    updateDocument,
    updateSubdocument
} from '../../../libs/backend.js';

export class BackendPasswordsRepository extends PasswordsRepository {
    constructor({ config }) {
        super({});
        this._config = config;
    }

    static passwordsSubscription = null;

    async createPassword({ passwordOperationRequest }) {
        const name = passwordOperationRequest.getName();
        const owner = passwordOperationRequest.getOwner();
        const password = passwordOperationRequest.getPassword();
        const url = passwordOperationRequest.getUrl();
        const username = passwordOperationRequest.getUsername();
        const folderId = passwordOperationRequest.getFolderId();

        
        const result = await createSubdocument('folders', folderId, 'passwords', {
            name,
            owner,
            password,
            url,
            username,
        });

        BackendPasswordsRepository.passwordsSubscription();

        return result;
    }

    async deletePassword({ passwordReferenceRequest }) {
        const folderId = passwordReferenceRequest.getFolderId();
        const passwordId = passwordReferenceRequest.getPasswordId();

        await deleteSubdocument('folders', folderId, 'passwords', passwordId);
        BackendPasswordsRepository.passwordsSubscription();
    }

    async editPassword({ passwordOperationRequest }) {
        const name = passwordOperationRequest.getName();
        const password = passwordOperationRequest.getPassword();
        const passwordId = passwordOperationRequest.getPasswordId();
        const url = passwordOperationRequest.getUrl();
        const username = passwordOperationRequest.getUsername();
        const folderId = passwordOperationRequest.getFolderId();

        const document = {
            name,
            password,
            url,
            username,
        };

        await updateSubdocument('folders', folderId, 'passwords', passwordId, document);
        BackendPasswordsRepository.passwordsSubscription();
    }

    /**
     * Subscribes to passwords of a specific folder
     * @param {PasswordSubscriptionRequest} passwordSubscriptionRequest Details to make the subscription
     * @returns {function} Function to call to unsubscribe
     */
    async subscribeToPasswords({ passwordSubscriptionRequest }) {
        const folderId = passwordSubscriptionRequest.getFolderId();
        const onSubscriptionChanges =
            passwordSubscriptionRequest.getOnSubscriptionChanges();

            
        BackendPasswordsRepository.passwordsSubscription = async () => {
            // Retrieve current userSharingSettings
            const passwords = await findSubdocument('folders', folderId, 'passwords', {});

            onSubscriptionChanges(passwords);
        };

        BackendPasswordsRepository.passwordsSubscription();

        return () => {
            BackendPasswordsRepository.passwordsSubscription = () => {}; // eslint-disable-line
        }; // eslint-disable-line 
    }
}
