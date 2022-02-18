// Third party dependencies
import firebaseUtils from '../../../libs/firebase.js';
// Repositories
import FirebaseFoldersRepository from './FirebaseFoldersRepository.js';
// Mappers
import {FoldersMappersFactory} from '../Mappers/factory.js';

export class FoldersRepositoriesFactory {
    static firebaseFoldersRepository = ({config}) =>
        new FirebaseFoldersRepository(({
            config,
            firebaseUtils,
            fromResultToFolderEntityMapper: FoldersMappersFactory.fromResultToFolderEntityMapper()
        }))
}