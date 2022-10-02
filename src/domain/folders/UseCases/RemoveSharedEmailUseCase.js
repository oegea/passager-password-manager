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

export class RemoveSharedEmailUseCase {
    /**
     * CTOR
     * @param {ShareFolderService} service Service to execute the use case
     */
    constructor({ service }) {
        this._service = service;
    }

    /**
     * Executes the use case to remove a shared folder with someone
     * @param {String} folderId Id of the folder
     * @param {String} email Email with who the folder will be unshared
     * @param {String} emailList List of emails with which the folder has been previously shared
     * @returns {Boolean} True if the folder is successfully unshared, false otherwise
     */
    async execute({ folderId, email, emailList }) {
        const folderShareRequest = FoldersRequestsFactory.folderShareRequest({
            email,
            emailList,
            folderId,
        });
        const result = await this._service.execute({ folderShareRequest });
        return result;
    }
}
