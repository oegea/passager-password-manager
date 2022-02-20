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