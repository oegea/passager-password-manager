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

export class ImportBackupService {
    constructor({ repository }) {
        this._repository = repository;
    }

    isValidBackup(backup) {
        // backup is an object
        if (typeof backup !== 'object') return false;

        // backup has auth, folders, language, storeMode, userSharingSettings and users properties
        if (
            !backup.hasOwnProperty('auth') ||
            !backup.hasOwnProperty('storeMode') ||
            !backup.hasOwnProperty('userSharingSettings') ||
            !backup.hasOwnProperty('users')
        )
            return false;

        return true;
    }

    async execute({ backupData }) {
        try {
            const backup = JSON.parse(backupData);

            if (!this.isValidBackup(backup))
                throw new Error('Invalid backup JSON detected');

            await this._repository.importBackup({ backup });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}
