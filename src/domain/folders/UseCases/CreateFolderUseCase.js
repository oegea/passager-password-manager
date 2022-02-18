import {FoldersRequestsFactory} from '../Requests/factory.js';

export class CreateFolderUseCase {
    
    /**
     * CTOR
     * @param {*} service Service to execute the action 
     */
    constructor({service}) {
        this._service = service;
    }

    async execute({folderName}) {
        const createFolderRequest = FoldersRequestsFactory.createFolderRequest({name: folderName});
        const [err, createdFolder] = await this._service.execute({createFolderRequest});

        if (err) throw new Error(err.message);
        return createdFolder.toJSON();
    }
}