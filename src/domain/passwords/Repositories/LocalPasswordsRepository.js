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

export class LocalPasswordsRepository extends PasswordsRepository {
    constructor({ config, LocalStorageDatabase }) {
        super({});
        this._config = config;
        this._LocalStorageDatabase = LocalStorageDatabase;
    }

    async createPassword({ passwordOperationRequest }) {
        const name = passwordOperationRequest.getName();
        const owner = passwordOperationRequest.getOwner();
        const password = passwordOperationRequest.getPassword();
        const url = passwordOperationRequest.getUrl();
        const username = passwordOperationRequest.getUsername();
        const folderId = passwordOperationRequest.getFolderId();

        return this._LocalStorageDatabase.createDocument(
            `folders.${folderId}.passwords`,
            {
                name,
                owner,
                password,
                url,
                username,
            }
        );
    }

    async deletePassword({ passwordReferenceRequest }) {
        const folderId = passwordReferenceRequest.getFolderId();
        const passwordId = passwordReferenceRequest.getPasswordId();

        this._LocalStorageDatabase.deleteDocument(
            `folders.${folderId}.passwords`,
            'id',
            passwordId
        );
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
        this._LocalStorageDatabase.updateDocument(
            `folders.${folderId}.passwords`,
            document,
            'id',
            passwordId
        );
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

        const subscription = this._LocalStorageDatabase.subscribeToLocalStorage(
            `folders.${folderId}.passwords`,
            onSubscriptionChanges
        );
        return subscription;
    }
}
