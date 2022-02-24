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

 export class DecryptPasswordService {
    constructor({
        AESDecrypt,
        importAESKey,
    }) {
        this._AESDecrypt = AESDecrypt;
        this._importAESKey = importAESKey;
    }

    async execute({passwordOperationRequest}) {
        // Retrieve data
        const folderKey = passwordOperationRequest.getFolderKey();
        const userPrivateKey = passwordOperationRequest.getUserPrivateKey();
        const decryptedFolderKey = await this._importAESKey(folderKey, userPrivateKey);

        // Decrypt username and password with the folder key
        let username = passwordOperationRequest.getUsername();
        let password = passwordOperationRequest.getPassword();
        username = await this._AESDecrypt(username, decryptedFolderKey);
        password = await this._AESDecrypt(password, decryptedFolderKey);

        // Set decrypted data
        passwordOperationRequest.setUsername(username);
        passwordOperationRequest.setPassword(password);

        return passwordOperationRequest;
    }

}