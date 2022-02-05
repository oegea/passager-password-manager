// Own libraries
import { db, fireStore } from './firebase.js';

const { addDoc, collection, doc, deleteDoc, limit, query, getDocs, writeBatch } = fireStore;

export const createFolder = async (user, folder) => {
    const collectionRef = collection(db, "folders");
    const docRef = await addDoc(collectionRef, {...folder, owner: user.uid});
    return docRef;
}

export const deleteFolder = async (folderId) => {
    const docRef = doc(db, "folders", folderId);

    await _deleteRelatedPasswords(folderId);

    deleteDoc(docRef);
}

const _deleteRelatedPasswords = async (folderId) => {
    const MAX_ITERATIONS = 1000;
    const DOCS_PER_ITERATION = 5;
    
    // Iteration
    for (let i = 0; i < MAX_ITERATIONS; i += 1){
        // Check if there are still existing passwords on this folder
        const q = query(collection(db, "folders", folderId, "passwords"), limit(DOCS_PER_ITERATION));
        const querySnapshot = await getDocs(q);

        // If not, exit
        if (querySnapshot.docs.length < 1)
            break;
        
        // Delete each of them
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => batch.delete(`/folders/${folderId}/passwords/${doc.id}`))
        await batch.commit();

    }

}