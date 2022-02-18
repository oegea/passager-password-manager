import FoldersRepository from './FoldersRepository.js';

export default class FirebaseFoldersRepository extends FoldersRepository {
    constructor({
        config,
        firebaseUtils,
        fromResultToFolderEntityMapper
    }) {
        super({})
        this._config = config;
        this._firebaseUtils = firebaseUtils;
        this._fromResultToFolderEntityMapper = fromResultToFolderEntityMapper;
    }

    async createFolder({createFolderRequest}){
        const {result} = await this._firebaseUtils.createFolder({createFolderRequest});
        return this._fromResultToFolderEntityMapper.map({result})
    }
}