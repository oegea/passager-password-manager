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
    exportLocalFiles,
    importLocalFiles,
    removeLocalFolderFiles,
} from '../../../libs/fileStorage.js';
import {
    getActiveProfileKeys,
    replaceActiveProfileKeys,
} from '../../../libs/profiles.js';

const DEVICE_BOUND_KEYS = [
    'biometricEnrollment',
    'biometricUserId',
    'biometricDeclined',
    'installDismissed',
];

const FILES_BACKUP_KEY = 'passagerFiles';

const getFolderIds = (folders) => {
    try {
        return (JSON.parse(folders) || [])
            .map((folder) => folder && folder.id)
            .filter(Boolean);
    } catch (e) {
        return [];
    }
};

export default class LocalUsersRepository extends BackupsRepository {
    constructor({ config, LocalStorageDatabase }) {
        super({});
        this._config = config;
        this._LocalStorageDatabase = LocalStorageDatabase;
    }

    /**
     * Gets a full backup of the user data and returns it as a string
     */
    async getFullBackup() {
        // Only the account in use: other accounts of this browser are theirs
        const backup = getActiveProfileKeys();
        for (const key of DEVICE_BOUND_KEYS) delete backup[key];
        const language = localStorage.getItem('language');
        if (language !== null) backup.language = language;

        // Large files live outside localStorage. They go last, so a version
        // that does not know them has restored everything else by then.
        const files = await exportLocalFiles(getFolderIds(backup.folders));
        if (files.length > 0) backup[FILES_BACKUP_KEY] = files;

        return JSON.stringify(backup);
    }

    async importBackup({ backup }) {
        const previousFolderIds = getFolderIds(localStorage.getItem('folders'));
        const { [FILES_BACKUP_KEY]: files, ...keys } = backup;

        // Replaces the account in use, and nothing else in this browser
        replaceActiveProfileKeys(keys);

        // Last, and never fatal: everything else is already restored
        try {
            await removeLocalFolderFiles(previousFolderIds);
            await importLocalFiles(files);
        } catch (e) {
            console.error(e);
        }
    }
}
