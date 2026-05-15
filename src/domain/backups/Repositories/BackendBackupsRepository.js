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

import BackupsRepository from './BackupsRepository.js';
import {
    findDocument,
    findSubdocument,
    retrieveServiceData,
} from '../../../libs/backend.js';

export default class BackendBackupsRepository extends BackupsRepository {
    constructor({ config }) {
        super({});
        this._config = config;
    }

    async getFullBackup() {
        const serviceData = retrieveServiceData();
        if (serviceData === null) {
            throw new Error(
                '[BackendBackupsRepository][getFullBackup] No active session'
            );
        }
        const email = serviceData.decodedJwtToken.email;

        const usersDocuments = (await findDocument('users', { email })) || [];
        const sharingDocuments =
            (await findDocument('userSharingSettings', { email })) || [];
        const ownedFolders =
            (await findDocument('folders', { owner: email })) || [];

        const userDoc = usersDocuments[0] || {};
        const sharingDoc = sharingDocuments[0] || {};

        const authPayload = {
            uid: email,
            email,
            displayName: userDoc.displayName || email,
            photoURL: userDoc.photoURL || '',
            initialized: userDoc.initialized || false,
            privateKey: userDoc.privateKey || '',
        };

        const usersCollection = [
            {
                id: userDoc.id || this._randomId(),
                uid: email,
                email,
                displayName: authPayload.displayName,
                photoURL: authPayload.photoURL,
                initialized: authPayload.initialized,
                privateKey: authPayload.privateKey,
            },
        ];

        const userSharingSettingsCollection = [
            {
                id: sharingDoc.id || this._randomId(),
                uid: email,
                email,
                publicKey: sharingDoc.publicKey || '',
            },
        ];

        const foldersCollection = ownedFolders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            key: folder.key,
            owner: folder.owner,
            sharedWith: JSON.stringify(folder.sharedWith || []),
        }));

        const backup = {
            auth: JSON.stringify(authPayload),
            users: JSON.stringify(usersCollection),
            userSharingSettings: JSON.stringify(userSharingSettingsCollection),
            folders: JSON.stringify(foldersCollection),
            storeMode: 'LOCAL',
        };

        const language = localStorage.getItem('language');
        if (language !== null) backup.language = language;

        for (const folder of ownedFolders) {
            const passwords =
                (await findSubdocument(
                    'folders',
                    folder.id,
                    'passwords',
                    {}
                )) || [];
            const passwordsCollection = passwords.map((password) => ({
                id: password.id,
                name: password.name,
                owner: password.owner,
                password: password.password,
                url: password.url,
                username: password.username,
            }));
            if (passwordsCollection.length === 0) continue;
            backup[`folders.${folder.id}.passwords`] =
                JSON.stringify(passwordsCollection);
        }

        return JSON.stringify(backup);
    }

    _randomId() {
        const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
        return uint32.toString(16);
    }
}
