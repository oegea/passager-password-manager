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

 export class ShareFolderService {
    constructor({
        repository,
        userOperationRequest,
        getUserPublicDetailsService,
        importRSAPublicKey,
        RSADecrypt,
        RSAEncrypt
    }) {
        this._repository = repository;
        this._userOperationRequest = userOperationRequest;
        this._getUserPublicDetailsService = getUserPublicDetailsService;
        this._importRSAPublicKey = importRSAPublicKey;
        this._RSADecrypt = RSADecrypt;
        this._RSAEncrypt = RSAEncrypt;
    }

    async execute({folderShareRequest}) {
        const userPrivateKey = folderShareRequest.getUserPrivateKey();
        const folderKey = folderShareRequest.getFolderKey();
        const email = folderShareRequest.getEmail();
        const userOperationRequest = this._userOperationRequest({email});
        const userPublicDetails = await this._getUserPublicDetailsService.execute({userOperationRequest});

        if (userPublicDetails === null)
            return false;

        // Get the public key of the user
        const {publicKey} = userPublicDetails;
        const importedPublicKey = await this._importRSAPublicKey(publicKey);

        // Decrypt the folder key
        const decryptedFolderKey = await this._RSADecrypt(folderKey, userPrivateKey);
        // Encrypt for the new user
        const encryptedFolderKey = await this._RSAEncrypt(decryptedFolderKey, importedPublicKey);
        folderShareRequest.setEncryptedFolderKey(encryptedFolderKey);

        const shareFolderResult = await this._repository.shareFolder({
            folderShareRequest,
            userPublicDetails
        });
        return shareFolderResult;
    }
}