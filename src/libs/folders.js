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
import { db, fireStore } from './firebase.js';

const { collection, limit, query, getDocs, writeBatch } = fireStore;

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
    

    await _deleteRelatedPasswords(folderId);

    return await domain.useCases.folders['delete_folder_use_case'].execute({
        id: folderId
    });
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