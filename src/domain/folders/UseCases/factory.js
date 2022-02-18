import {FoldersServicesFactory} from '../Services/factory.js';
import {CreateFolderUseCase} from './CreateFolderUseCase.js';

export default class FoldersUseCasesFactory {
    static CreateFolderUseCase = ({config}) => 
        new CreateFolderUseCase({
            service: FoldersServicesFactory.createFolderService({config})
        });
}