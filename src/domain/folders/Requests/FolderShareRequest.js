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

 export class FolderShareRequest {
    constructor({
        folderName = '', 
        folderId = '', 
        folderKey = '', 
        email = '', 
        emailList = [], 
        userPrivateKey = ''
    }) {
        this._folderName = folderName;
        this._folderId = folderId;
        this._folderKey = folderKey;
        this._email = email;
        this._emailList = emailList;
        this._userPrivateKey = userPrivateKey;
    }

    getFolderName() {
        return this._folderName;
    }

    getFolderId() {
        return this._folderId;
    }

    getFolderKey() {
        return this._folderKey;
    }

    getEmail() {
        return this._email;
    }

    getEmailList() {
        return this._emailList;
    }

    setEmailList(emailList) {
        this._emailList = emailList;
    }

    getUserPrivateKey() {
        return this._userPrivateKey;
    }

    getEncryptedFolderKey() {
        return this._encryptedFolderKey;
    }

    setEncryptedFolderKey(encryptedFolderKey) {
        this._encryptedFolderKey = encryptedFolderKey;
    }
}