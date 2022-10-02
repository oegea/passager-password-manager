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

export default class FoldersRepository {
    /**
     * Creates a folder in firebase and returns a FolderEntity
     */
    async createFolder() {
        throw new Error(
            '[FoldersRepository][createFolder] is not implemented yet'
        );
    }

    async editFolder() {
        throw new Error(
            '[FoldersRepository][editFolder] is not implemented yet'
        );
    }

    async deleteFolder() {
        throw new Error(
            '[FoldersRepository][deleteFolder] is not implemented yet'
        );
    }

    async deleteFolderRelatedPasswords() {
        throw new Error(
            '[FoldersRepository][deleteFolderRelatedPasswords] is not implemented yet'
        );
    }

    async subscribeToFolders() {
        throw new Error(
            '[FoldersRepository][subscribeToFolders] is not implemented yet'
        );
    }

    async shareFolder() {
        throw new Error(
            '[FoldersRepository][shareFolder] is not implemented yet'
        );
    }

    async updateFolderSharedWith() {
        throw new Error(
            '[FoldersRepository][updateFolderSharedWith] is not implemented yet'
        );
    }

    async unshareFolder() {
        throw new Error(
            '[FoldersRepository][unshareFolder] is not implemented yet'
        );
    }
}
