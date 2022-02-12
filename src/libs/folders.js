// Own libraries
import { db, fireStore } from './firebase.js';
import {generateExportableAESKey} from './crypto.js';

const { addDoc, collection, doc, deleteDoc, limit, query, getDocs, writeBatch } = fireStore;

export const createFolder = async (user, folder) => {
    // Generate the folder's key
    const key = await generateExportableAESKey(user.publicKey);
    // Create the folder in the database
    const collectionRef = collection(db, "folders");
    const docRef = await addDoc(collectionRef, {...folder, key, owner: user.uid});
    return docRef;
}

export const deleteFolder = async (folderId) => {
    const docRef = doc(db, "folders", folderId);

    await _deleteRelatedPasswords(folderId);

    deleteDoc(docRef);
}

const _deleteRelatedPasswords = async (folderId) => {
    const MAX_ITERATIONS = 1000;
    const DOCS_PER_ITERATION = 10;
    
    // Iteration
    for (let i = 0; i < MAX_ITERATIONS; i += 1){
        // Check if there are still existing passwords on this folder
        const q = query(collection(db, "folders", folderId, "passwords"), limit(DOCS_PER_ITERATION));
        const querySnapshot = await getDocs(q);
        
        // Delete each of them
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => batch.delete(doc.ref))
        await batch.commit();

        // If this was the last iteration
        if (querySnapshot.docs.length < DOCS_PER_ITERATION)
            break;

        if ( i === MAX_ITERATIONS - 1)
            throw new Error('Too many passwords to delete');
    }

}