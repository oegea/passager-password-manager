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
// Own libs
import { setCredentials } from './biometric.js';

export const checkPassword = (password) => {
    let strengthValue = {
        caps: false,
        length: false,
        special: false,
        numbers: false,
        small: false,
    };

    if (password.length >= 8) {
        strengthValue.length = true;
    }

    if (password.match(/[A-Z]/)) {
        strengthValue.caps = true;
    }

    if (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)) {
        strengthValue.special = true;
    }

    if (password.match(/[0-9]/)) {
        strengthValue.numbers = true;
    }

    if (password.match(/[a-z]/)) {
        strengthValue.small = true;
    }

    return strengthValue;
};

export const setUserMasterPassword = async (
    user,
    password,
    reloadAuthDetails,
    decryptPrivateKey
) => {
    const { displayName, email, photoURL, uid } = user;

    await domain.useCases.users['set_user_master_password_use_case'].execute({
        displayName,
        email,
        password,
        photoURL,
        uid,
    });

    setCredentials(password);
    if (reloadAuthDetails) {
        await reloadAuthDetails();
    }

    if (decryptPrivateKey) {
        await decryptPrivateKey(password, false);
    }
};
