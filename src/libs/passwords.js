// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, updateDoc, collection, doc } = fireStore;


export const createPassword = async (user, folderId, password) => {
    const subcollectionRef = collection(db, "folders", folderId, "passwords");

    let docRef = await addDoc(subcollectionRef, {...password, owner: user.uid});

    return docRef;
}

export const editPassword = (folderId, passwordId,  password) => {
    const subcollectionRef = doc(db, "folders", folderId, "passwords", passwordId);

    updateDoc(subcollectionRef, password);
}