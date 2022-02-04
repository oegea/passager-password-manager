// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, updateDoc, collection, doc } = fireStore;


export const createPassword = (user, folderId, password) => {
    const subcollectionRef = collection(db, "folders", folderId, "passwords");

    addDoc(subcollectionRef, {...password, owner: user.uid});
}

export const editPassword = (folderId, passwordId,  password) => {
    const subcollectionRef = doc(db, "folders", folderId, "passwords", passwordId);

    updateDoc(subcollectionRef, password);
}