// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, collection, doc, deleteDoc } = fireStore;

export const createFolder = (user, folder) => {
    addDoc(collection(db, "folders"), {...folder, owner: user.uid});
}

export const deleteFolder = (folderId) => {
    const docRef = doc(db, "folders", folderId);
    deleteDoc(docRef);
}