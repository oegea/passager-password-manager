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

import {FoldersRequestsFactory} from '../Requests/factory.js';

describe('Requests Factory tests', ()=>{
    it('should properly create a CreateFolderRequest', ()=>{
        const DEFAULT_NAME = 'folder name';
        const DEFAULT_USER_ID = '123';
        const DEFAULT_PUBLIC_KEY = '123';
        const folderRequest = FoldersRequestsFactory.createFolderRequest({
            name: DEFAULT_NAME, 
            owner: DEFAULT_USER_ID,
            publicKey: DEFAULT_PUBLIC_KEY
        });

        expect(typeof folderRequest).toBe('object');
        expect(folderRequest.getName()).toBe(DEFAULT_NAME)
        expect(folderRequest.getOwner()).toBe(DEFAULT_USER_ID);
        expect(folderRequest.getPublicKey()).toBe(DEFAULT_PUBLIC_KEY);
    })
});