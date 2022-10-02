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

export class EditPasswordService {
    constructor({ AESEncrypt, importAESKey, repository }) {
        this._AESEncrypt = AESEncrypt;
        this._importAESKey = importAESKey;
        this._repository = repository;
    }

    async execute({ passwordOperationRequest }) {
        // Decrypt folder key
        const folderKey = passwordOperationRequest.getFolderKey();
        const userPrivateKey = passwordOperationRequest.getUserPrivateKey();
        const decryptedFolderKey = await this._importAESKey(
            folderKey,
            userPrivateKey
        );

        // Encrypt username and password with the folder key
        let username = passwordOperationRequest.getUsername();
        let password = passwordOperationRequest.getPassword();
        username = await this._AESEncrypt(username, decryptedFolderKey);
        password = await this._AESEncrypt(password, decryptedFolderKey);
        passwordOperationRequest.setUsername(username);
        passwordOperationRequest.setPassword(password);

        const editResult = await this._repository.editPassword({
            passwordOperationRequest,
        });
        return editResult;
    }
}
