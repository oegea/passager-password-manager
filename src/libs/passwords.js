// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, collection } = fireStore;


export const createPassword = (user, folderId, password) => {
    const subcollectionRef = collection(db, "folders", folderId, "passwords");

    addDoc(subcollectionRef, {...password, owner: user.uid});
}