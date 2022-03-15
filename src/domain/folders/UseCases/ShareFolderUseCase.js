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

import {FoldersRequestsFactory} from '../Requests/factory.js';

export class ShareFolderUseCase {
    
    /**
     * CTOR
     * @param {ShareFolderService} service Service to execute the use case 
     */
    constructor({service}) {
        this._service = service;
    }

    /**
     * Executes the use case to share a folder
     * @param {String} folderName Name of the folder to share
     * @param {String} folderId Id of the folder to share
     * @param {String} folderKey Key of the folder to share
     * @param {String} email Email of the user to share the folder with
     * @param {String} emailList List of emails with which the folder has been previously shared
     * @param {String} userPrivateKey Private key to decrypt the folder key
     * @returns {Boolean} True if the folder is successfully shared, false otherwise
     */
    async execute({folderName, folderId, folderKey, email, emailList, userPrivateKey}) {
        const folderShareRequest = FoldersRequestsFactory.folderShareRequest({
            folderName,
            folderId,
            folderKey,
            email,
            emailList,
            userPrivateKey
        });
        const result = await this._service.execute({folderShareRequest});
        return result;
    }
}