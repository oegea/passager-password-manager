// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, collection, doc, deleteDoc } = fireStore;

export const createFolder = async (user, folder) => {
    const collectionRef = collection(db, "folders");
    const docRef = await addDoc(collectionRef, {...folder, owner: user.uid});
    return docRef;
}

export const deleteFolder = (folderId) => {
    const docRef = doc(db, "folders", folderId);
    deleteDoc(docRef);
}