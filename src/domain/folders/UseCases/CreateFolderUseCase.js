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

import { FoldersRequestsFactory } from '../Requests/factory.js';

export class CreateFolderUseCase {
    /**
     * CTOR
     * @param {CreateFolderService} service Service to execute the use case
     */
    constructor({ service }) {
        this._service = service;
    }

    /**
     * Executes the use case to create a new folder
     * @param {String} userId Identifier of the owner
     * @param {String} userPublicKey Public key of the owner
     * @param {String} folderName Name for the new folder
     * @returns {DocumentReference} Reference to the created folder
     */
    async execute({ userId, userPublicKey, folderName }) {
        const folderOperationRequest =
            FoldersRequestsFactory.folderOperationRequest({
                name: folderName,
                owner: userId,
                publicKey: userPublicKey,
            });
        const result = await this._service.execute({ folderOperationRequest });
        return result;
    }
}
