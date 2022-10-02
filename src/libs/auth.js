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

//Own libraries
import { fireAuth } from './firebase.js';

const { getAuth, signOut } = fireAuth;

export const logout = () => {
    const auth = getAuth();
    signOut(auth);
    localStorage.setItem('storeMode', 'FIREBASE');
    window.location.href = '/';
};

export const getUserDocument = async (user) => {
    if (user === null) return null;

    const { uid, email, displayName, photoURL } = user;

    const userDocument = await domain.useCases.users[
        'get_and_create_user_document_use_case'
    ].execute({
        uid,
        email,
        displayName,
        photoURL,
    });

    return userDocument;
};

export const getUserPublicKey = async (user) => {
    const publicKey = await domain.useCases.users[
        'get_user_public_key_use_case'
    ].execute({
        email: user.email,
    });

    return publicKey;
};
