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

// Factories
import {FoldersServicesFactory} from '../Services/factory.js';
// Use cases
import {CreateFolderUseCase} from './CreateFolderUseCase.js';
import {DeleteFolderUseCase} from './DeleteFolderUseCase.js';
import {EditFolderUseCase} from './EditFolderUseCase.js';
import {SubscribeToFoldersUseCase} from './SubscribeToFoldersUseCase.js';
import {SubscribeToSharedFoldersUseCase} from './SubscribeToSharedFoldersUseCase.js';
import {ShareFolderUseCase} from './ShareFolderUseCase.js';

export class FoldersUseCasesFactory {
    static createFolderUseCase = ({config}) => 
        new CreateFolderUseCase({
            service: FoldersServicesFactory.createFolderService({config})
        });

    static editFolderUseCase = ({config}) =>
        new EditFolderUseCase({
            service: FoldersServicesFactory.editFolderService({config})
        });

    static deleteFolderUseCase = ({config}) =>
        new DeleteFolderUseCase({
            service: FoldersServicesFactory.deleteFolderService({config})
        })
    
    static subscribeToFoldersUseCase = ({config}) =>
        new SubscribeToFoldersUseCase({
            service: FoldersServicesFactory.subscribeToFoldersService({config})
        });
    
    static subscribeToSharedFoldersUseCase = ({config}) =>
        new SubscribeToSharedFoldersUseCase({
            service: FoldersServicesFactory.subscribeToSharedFoldersService({config})
        });
    
    static shareFolderUseCase = ({config}) =>
        new ShareFolderUseCase({
            service: FoldersServicesFactory.shareFolderService({config})
        });
}