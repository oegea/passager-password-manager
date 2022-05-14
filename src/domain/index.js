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

// Domain config
import config from './config/index.js';
// Use cases
import {FoldersUseCasesFactory} from './folders/UseCases/factory.js';
import {PasswordsUseCasesFactory} from './passwords/UseCases/factory.js';
import {UsersUseCasesFactory} from './users/UseCases/factory.js';
import {BackupsUseCasesFactory} from './backups/UseCases/factory.js';

const useCases = {
    'folders': {
        'create_folder_use_case': FoldersUseCasesFactory.createFolderUseCase({config}),
        'delete_folder_use_case': FoldersUseCasesFactory.deleteFolderUseCase({config}),
        'edit_folder_use_case': FoldersUseCasesFactory.editFolderUseCase({config}),
        'subscribe_to_folders_use_case': FoldersUseCasesFactory.subscribeToFoldersUseCase({config}),
        'subscribe_to_shared_folders_use_case': FoldersUseCasesFactory.subscribeToSharedFoldersUseCase({config}),
        'share_folder_use_case': FoldersUseCasesFactory.shareFolderUseCase({config}),
        'remove_shared_email_use_case': FoldersUseCasesFactory.removeSharedEmailUseCase({config})
    },
    'passwords': {
        'create_password_use_case': PasswordsUseCasesFactory.createPasswordUseCase({config}),
        'decrypt_password_use_case': PasswordsUseCasesFactory.decryptPasswordUseCase({config}),
        'delete_password_use_case': PasswordsUseCasesFactory.deletePasswordUseCase({config}),
        'edit_password_use_case': PasswordsUseCasesFactory.editPasswordUseCase({config}),
        'subscribe_to_passwords_use_case': PasswordsUseCasesFactory.subscribeToPasswordsUseCase({config})
    },
    'users': {
        'update_user_public_key_use_case': UsersUseCasesFactory.updateUserPublicKeyUseCase({config}),
        'get_user_public_key_use_case': UsersUseCasesFactory.getUserPublicKeyUseCase({config}),
        'get_and_create_user_document_use_case': UsersUseCasesFactory.getAndCreateUserDocumentUseCase({config}),
        'set_user_master_password_use_case': UsersUseCasesFactory.setUserMasterPasswordUseCase({config}),
        'subscribe_to_auth_state_change_use_case': UsersUseCasesFactory.subscribeToAuthStateChangeUseCase({config})
    },
    'backups': {
        'get_backup_use_case': BackupsUseCasesFactory.getBackupUseCase({config}),
        'import_backup_use_case': BackupsUseCasesFactory.importBackupUseCase({config})
    }
}

const domain = {
    config,
    useCases
};

export default domain;