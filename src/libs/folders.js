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

// Own libraries
import firebase from './firebase.js';
import {RSADecrypt, RSAEncrypt, importRSAPublicKey} from './crypto.js';

export const createFolder = async (user, folder) => {
    return await domain.useCases.folders['create_folder_use_case'].execute({
        folderName: folder.name,
        userId: user.uid, 
        userPublicKey: user.publicKey 
    });
}

export const editFolder = async(folderId, folder) => {
    return await domain.useCases.folders['edit_folder_use_case'].execute({
        id: folderId, 
        name: folder.name
    });
}

export const deleteFolder = async (folderId) => {
    return await domain.useCases.folders['delete_folder_use_case'].execute({
        id: folderId
    });
}

export const shareFolder = async (folderName, folderId, folderKey, email, emailList, userPrivateKey) => {
    return await domain.useCases.folders['share_folder_use_case'].execute({
        folderName, folderId, folderKey, email, emailList, userPrivateKey
    });
}

export const removeEmail = async (folderId, email, emailList) => {
    const {db, fireStore} = firebase;
    const {doc, updateDoc, deleteDoc} = fireStore;

    // Remove e-mail from emailList
    const index = emailList.indexOf(email);
    if (index > -1) {
        emailList.splice(index, 1);
    }

    // Save the new email list updating the folder in firebase
    const folderRef = doc(db, "folders", folderId);
    await updateDoc(folderRef, {
        sharedWith: JSON.stringify(emailList)
    });

    // Gets the public Key of the user by e-mail
    const user = await _getUserPublicDetails(email);

    if (user === null)
        return false;

    const {uid} = user;

    // Remove the folder from the user's shared folders
    const docRef = doc(db, "userSharingSettings", uid, "sharedFolders", folderId);
    await deleteDoc(docRef);

    return true;
}

export const _getUserPublicDetails = async (email) => {

    // Load firebase library
    const {db, fireStore} = firebase;
    const {collection, query, where, limit, getDocs} = fireStore;

    const collectionRef = collection(db, "userSharingSettings");
    const q = query(collectionRef, where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);

    // If email doesn't exists, return false
    if (querySnapshot.docs.length === 0) {
        return null;
    }

    // Get the public key of the user
    const publicKey = querySnapshot.docs[0].data().publicKey;
    const uid = querySnapshot.docs[0].id;   

    return {
        publicKey,
        uid
    };

}