export class CreateFolderRequest {
    constructor({name}) {
        this._name = name;
    }

    getName() {
        return this._name;
    }
}