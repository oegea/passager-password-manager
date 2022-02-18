export class CreateFolderService {
    constructor({repository}) {
        this._repository = repository;
    }

    async execute({createFolderRequest}) {
        const createFolderResult = await this._repository.createFolder({
            createFolderRequest
        });

        return createFolderResult;
    }
}