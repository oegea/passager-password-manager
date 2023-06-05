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
import LocalStorageDatabase from '@useful-tools/localstorage';
// Repositories
import LocalBackupsRepository from './LocalBackupsRepository.js';
import BackupsRepository from './BackupsRepository.js';

export class BackupsRepositoriesFactory {
    static localBackupsRepository = ({ config }) =>
        new LocalBackupsRepository({
            config,
            LocalStorageDatabase,
        });

    static firebaseBackupsRepository = () => new BackupsRepository();

    static getRepository = ({ config }) => {
        const storeMode = config.get('storeMode');
        switch (storeMode) {
        case config.get('FIREBASE_STORE_MODE'):
            return BackupsRepositoriesFactory.firebaseBackupsRepository({
                config,
            });
        case config.get('LOCAL_STORE_MODE'):
            return BackupsRepositoriesFactory.localBackupsRepository({
                config,
            });
        case config.get('BACKEND_STORE_MODE'):
            return BackupsRepositoriesFactory.localBackupsRepository({
                config,
            });
        default:
            throw new Error(`Unknown store mode: ${storeMode}`);
        }
    };
}
