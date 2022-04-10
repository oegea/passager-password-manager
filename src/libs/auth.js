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
import { db, fireStore, fireAuth } from './firebase.js';

const { doc, getDoc, setDoc} = fireStore;
const { getAuth, signOut } = fireAuth;

export const logout = () => {
    const auth = getAuth();
    signOut(auth);
    window.location.href = '/';
}

export const getUserDocument = async (user) => {
    if (user === null)
        return null;

    const {uid, email, displayName, photoURL} = user;

    // Retrieve current user document
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    // If exists, return
    if (docSnap.exists()) {
        return {uid, ...docSnap.data()};
    }

    // If not, create and return
    let userDocument = {
        email, displayName, photoURL
    };

    await updateUserDocument(uid, userDocument);
    return {uid, ...userDocument};
}

export const getUserPublicKey = async (user) => {
    const publicKey = await domain.useCases.users['get_user_public_key_use_case'].execute({
        email: user.email
    });
    
    return publicKey;
}

export const updateUserDocument = async (uid, userDocument) => {
    const initializedUserDocument = userDocumentFactory(userDocument);
    await setDoc(doc(db, "users", uid), {...initializedUserDocument});
};

export const userDocumentFactory = ({
    email, 
    displayName, 
    photoURL, 
    initialized = false,
    privateKey = ''
}) => {
    return { email, displayName, photoURL, initialized, privateKey };
}