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

// Domain
import domain from '../domain/index.js';

export const decryptPassword = async (
    passwordDocument,
    folderKey,
    userPrivateKey
) => {
    const decryptPasswordResult = await domain.useCases.passwords[
        'decrypt_password_use_case'
    ].execute({
        folderKey,
        password: passwordDocument.password,
        username: passwordDocument.username,
        userPrivateKey,
    });

    const { username, password } = decryptPasswordResult;

    return {
        ...passwordDocument,
        username,
        password,
    };
};

export const createPassword = async (
    user,
    folderId,
    passwordDocument,
    folderKey,
    userPrivateKey
) => {
    return await domain.useCases.passwords['create_password_use_case'].execute({
        folderId,
        folderKey,
        name: passwordDocument.name,
        owner: user.uid,
        password: passwordDocument.password,
        url: passwordDocument.url,
        username: passwordDocument.username,
        userPrivateKey,
    });
};

export const deletePassword = async (folderId, passwordId) => {
    return await domain.useCases.passwords['delete_password_use_case'].execute({
        folderId,
        passwordId,
    });
};

export const editPassword = async (
    folderId,
    passwordId,
    passwordDocument,
    folderKey,
    userPrivateKey
) => {
    return await domain.useCases.passwords['edit_password_use_case'].execute({
        folderId,
        folderKey,
        name: passwordDocument.name,
        password: passwordDocument.password,
        passwordId,
        url: passwordDocument.url,
        username: passwordDocument.username,
        userPrivateKey,
    });
};
