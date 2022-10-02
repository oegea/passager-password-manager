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
import {
    importRSAPublicKey,
    RSADecrypt,
    RSAEncrypt,
    generateExportableAESKey,
} from '@useful-tools/crypto';
// Services
import { CreateFolderService } from './CreateFolderService.js';
import { DeleteFolderService } from './DeleteFolderService.js';
import { EditFolderService } from './EditFolderService.js';
import { DeleteFolderRelatedPasswordsService } from './DeleteFolderRelatedPasswordsService.js';
import { SubscribeToFoldersService } from './SubscribeToFoldersService.js';
import { SubscribeToSharedFoldersService } from './SubscribeToSharedFoldersService.js';
import { ShareFolderService } from './ShareFolderService.js';
import { RemoveSharedEmailService } from './RemoveSharedEmailService.js';
// Factories
import { FoldersRepositoriesFactory } from '../Repositories/factory.js';
import { UsersRequestsFactory } from '../../users/Requests/factory.js';
import { UsersServicesFactory } from '../../users/Services/factory.js';

export class FoldersServicesFactory {
    static createFolderService = ({ config }) =>
        new CreateFolderService({
            generateExportableAESKey,
            repository: FoldersRepositoriesFactory.getRepository({ config }),
        });

    static deleteFolderRelatedPasswordsService = ({ config }) =>
        new DeleteFolderRelatedPasswordsService({
            repository: FoldersRepositoriesFactory.getRepository({ config }),
        });

    static deleteFolderService = ({ config }) =>
        new DeleteFolderService({
            repository: FoldersRepositoriesFactory.getRepository({ config }),
            deleteFolderRelatedPasswordsService:
                FoldersServicesFactory.deleteFolderRelatedPasswordsService({
                    config,
                }),
        });

    static editFolderService = ({ config }) =>
        new EditFolderService({
            repository: FoldersRepositoriesFactory.getRepository({ config }),
        });

    static subscribeToFoldersService = ({ config }) =>
        new SubscribeToFoldersService({
            repository: FoldersRepositoriesFactory.getRepository({ config }),
        });

    static subscribeToSharedFoldersService = ({ config }) =>
        new SubscribeToSharedFoldersService({
            repository: FoldersRepositoriesFactory.getRepository({ config }),
        });

    static shareFolderService = ({ config }) =>
        new ShareFolderService({
            getUserPublicDetailsService:
                UsersServicesFactory.getUserPublicDetailsService({ config }),
            importRSAPublicKey,
            repository: FoldersRepositoriesFactory.getRepository({ config }),
            RSADecrypt,
            RSAEncrypt,
            userOperationRequest: UsersRequestsFactory.userOperationRequest,
        });

    static removeSharedEmailService = ({ config }) =>
        new RemoveSharedEmailService({
            getUserPublicDetailsService:
                UsersServicesFactory.getUserPublicDetailsService({ config }),
            repository: FoldersRepositoriesFactory.getRepository({ config }),
            userOperationRequest: UsersRequestsFactory.userOperationRequest,
        });
}
