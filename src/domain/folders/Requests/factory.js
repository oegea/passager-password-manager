import {CreateFolderRequest} from './CreateFolderRequest.js';

export class FoldersRequestsFactory {
    static createFolderRequest = ({name}) => {
        return new CreateFolderRequest({name});
    }
}