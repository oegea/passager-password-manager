// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, deleteDoc, updateDoc, collection, doc } = fireStore;


export const createPassword = async (user, folderId, password) => {
    const subcollectionRef = collection(db, "folders", folderId, "passwords");

    let docRef = await addDoc(subcollectionRef, {...password, owner: user.uid});

    return docRef;
}

export const deletePassword = (folderId, passwordId) => {
    const docRef = doc(db, "folders", folderId, "passwords", passwordId);
    deleteDoc(docRef);
}

export const editPassword = (folderId, passwordId,  password) => {
    const docRef = doc(db, "folders", folderId, "passwords", passwordId);

    updateDoc(docRef, password);
}