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

export class CreateFolderService {
    constructor({ generateExportableAESKey, repository }) {
        this._generateExportableAESKey = generateExportableAESKey;
        this._repository = repository;
    }

    async execute({ folderOperationRequest }) {
        // Generate a key to encrypt the folder
        const userPublicKey = folderOperationRequest.getPublicKey();
        const key = await this._generateExportableAESKey(userPublicKey);
        folderOperationRequest.setFolderKey(key);

        const createFolderResult = await this._repository.createFolder({
            folderOperationRequest,
        });

        return createFolderResult;
    }
}
