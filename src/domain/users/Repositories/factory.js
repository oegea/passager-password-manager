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

// Third party dependencies
import firebaseUtils from '../../../libs/firebase.js';
import LocalStorageDatabase from '@useful-tools/localstorage';
// Repositories
import FirebaseUsersRepository from './FirebaseUsersRepository.js';
import LocalUsersRepository from './LocalUsersRepository.js';
import BackendUsersRepository from './BackendUsersRepository.js';
// Factories
import { UsersEntitiesFactory } from '../Entities/factory.js';

export class UsersRepositoriesFactory {
    static firebaseUsersRepository = ({ config }) =>
        new FirebaseUsersRepository({
            config,
            firebaseUtils,
        });

    static localUsersRepository = ({ config }) =>
        new LocalUsersRepository({
            config,
            LocalStorageDatabase,
            userDocumentEntity: UsersEntitiesFactory.userDocumentEntity,
        });

    static backendUsersRepository = ({ config }) =>
        new BackendUsersRepository({
            config,
            userDocumentEntity: UsersEntitiesFactory.userDocumentEntity,
        });

    static getRepository = ({ config }) => {
        const storeMode = config.get('storeMode');
        switch (storeMode) {
        case config.get('FIREBASE_STORE_MODE'):
            return UsersRepositoriesFactory.firebaseUsersRepository({
                config,
            });
        case config.get('LOCAL_STORE_MODE'):
            return UsersRepositoriesFactory.localUsersRepository({
                config,
            });
        case config.get('BACKEND_STORE_MODE'):
            return UsersRepositoriesFactory.backendUsersRepository({
                config,
            });
        default:
            throw new Error(`Unknown store mode: ${storeMode}`);
        }
    };
}
