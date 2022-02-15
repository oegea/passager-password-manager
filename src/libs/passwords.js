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

// Own libraries
import { db, fireStore } from './firebase.js';
import { importAESKey, AESEncrypt, AESDecrypt } from './crypto.js';

const { addDoc, deleteDoc, updateDoc, collection, doc } = fireStore;

export const decryptPassword = async(passwordDocument, folderKey, userPrivateKey) => {
    const decryptedFolderKey = await importAESKey(folderKey, userPrivateKey);
    const username = await AESDecrypt(passwordDocument.username, decryptedFolderKey);
    const password = await AESDecrypt(passwordDocument.password, decryptedFolderKey);

    
    return {...passwordDocument, username, password};
}

export const createPassword = async (user, folderId, passwordDocument, folderKey, userPrivateKey) => {
    const decryptedFolderKey = await importAESKey(folderKey, userPrivateKey);

    // Encrypt username and password
    const username = await AESEncrypt(passwordDocument.username, decryptedFolderKey);
    const password = await AESEncrypt(passwordDocument.password, decryptedFolderKey);

    const subcollectionRef = collection(db, "folders", folderId, "passwords");

    let docRef = await addDoc(subcollectionRef, {...passwordDocument, username, password, owner: user.uid});

    return docRef;
}

export const deletePassword = (folderId, passwordId) => {
    const docRef = doc(db, "folders", folderId, "passwords", passwordId);
    deleteDoc(docRef);
}

export const editPassword = async (folderId, passwordId,  passwordDocument, folderKey, userPrivateKey) => {
    const decryptedFolderKey = await importAESKey(folderKey, userPrivateKey);

    // Encrypt username and password
    const username = await AESEncrypt(passwordDocument.username, decryptedFolderKey);
    const password = await AESEncrypt(passwordDocument.password, decryptedFolderKey);

    const docRef = doc(db, "folders", folderId, "passwords", passwordId);

    updateDoc(docRef, {...passwordDocument, username, password});
}