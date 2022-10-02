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

// Own libraries
import { createExportableRSAKeyPair } from '@useful-tools/crypto';
// Services
import { GetUserPublicDetailsService } from './GetUserPublicDetailsService.js';
import { UpdateUserPublicKeyService } from './UpdateUserPublicKeyService.js';
import { GetUserPublicKeyService } from './GetUserPublicKeyService.js';
import { GetAndCreateUserDocumentService } from './GetAndCreateUserDocumentService.js';
import { UpdateUserDocumentService } from './UpdateUserDocumentService.js';
import { SetUserMasterPasswordService } from './SetUserMasterPasswordService.js';
import { SubscribeToAuthStateChangeService } from './SubscribeToAuthStateChangeService.js';
// Factories
import { UsersRepositoriesFactory } from '../Repositories/factory.js';
import { UsersEntitiesFactory } from '../Entities/factory.js';

export class UsersServicesFactory {
    static getUserPublicDetailsService = ({ config }) =>
        new GetUserPublicDetailsService({
            repository: UsersRepositoriesFactory.getRepository({ config }),
        });

    static getUserPublicKeyService = ({ config }) =>
        new GetUserPublicKeyService({
            repository: UsersRepositoriesFactory.getRepository({ config }),
        });

    static updateUserPublicKeyService = ({ config }) =>
        new UpdateUserPublicKeyService({
            repository: UsersRepositoriesFactory.getRepository({ config }),
        });

    static getAndCreateUserDocumentService = ({ config }) =>
        new GetAndCreateUserDocumentService({
            repository: UsersRepositoriesFactory.getRepository({ config }),
            userDocumentEntity: UsersEntitiesFactory.userDocumentEntity,
            updateUserDocumentService:
                UsersServicesFactory.updateUserDocumentService({ config }),
        });

    static updateUserDocumentService = ({ config }) =>
        new UpdateUserDocumentService({
            repository: UsersRepositoriesFactory.getRepository({ config }),
        });

    static setUserMasterPasswordService = ({ config }) =>
        new SetUserMasterPasswordService({
            createExportableRSAKeyPair,
            updateUserDocumentService:
                UsersServicesFactory.updateUserDocumentService({ config }),
            updateUserPublicKeyService:
                UsersServicesFactory.updateUserPublicKeyService({ config }),
            userDocumentEntity: UsersEntitiesFactory.userDocumentEntity,
        });

    static subscribeToAuthStateChangeService = ({ config }) =>
        new SubscribeToAuthStateChangeService({
            repository: UsersRepositoriesFactory.getRepository({ config }),
        });
}
