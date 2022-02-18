import {FoldersRepositoriesFactory} from '../Repositories/factory.js';
import {CreateFolderService} from './CreateFolderService.js';

export class FoldersServicesFactory {
    static createFolderService = ({config}) => 
        new CreateFolderService({
            repository: FoldersRepositoriesFactory.firebaseRepository({config})
        })
}