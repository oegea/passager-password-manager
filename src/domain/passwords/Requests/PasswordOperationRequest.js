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

export class PasswordOperationRequest {
    constructor({
        folderId,
        folderKey,
        name,
        owner,
        password,
        passwordId = '',
        url,
        username,
        userPrivateKey
    }) {
        this._folderId = folderId;
        this._folderKey = folderKey;
        this._name = name;
        this._owner = owner;
        this._password = password;
        this._passwordId = passwordId;
        this._url = url;
        this._username = username;
        this._userPrivateKey = userPrivateKey;
    }

    getFolderId() {
        return this._folderId;
    }

    getFolderKey() {
        return this._folderKey;
    }
    
    getName() {
        return this._name;
    }

    getOwner() {
        return this._owner;
    }

    getPassword() {
        return this._password;
    }

    setPassword(password) {
        this._password = password;
    }

    getPasswordId() {
        return this._passwordId;
    }

    getUrl() {
        return this._url;
    }

    getUsername() {
        return this._username;
    }

    setUsername(username) {
        this._username = username;
    }

    getUserPrivateKey() {
        return this._userPrivateKey;
    }

}