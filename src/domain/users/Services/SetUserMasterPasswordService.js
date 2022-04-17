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

 export class SetUserMasterPasswordService {
    constructor({
        createExportableRSAKeyPair,
        updateUserDocumentService,
        updateUserPublicKeyService,
        userDocumentEntity
    }) {
        this._createExportableRSAKeyPair = createExportableRSAKeyPair;
        this._updateUserDocumentService = updateUserDocumentService;
        this._updateUserPublicKeyService = updateUserPublicKeyService;
        this._userDocumentEntity = userDocumentEntity;
    }

    async execute({userOperationRequest}) {
        // Retrieve data from the user operation request
        const displayName = userOperationRequest.getDisplayName();
        const email = userOperationRequest.getEmail();
        const password = userOperationRequest.getPassword();
        const photoURL = userOperationRequest.getPhotoURL();
        // Generate key pair
        const keyPair = await this._createExportableRSAKeyPair(password);
        // Store encrypted private key in user document
        const userDocumentEntity = this._userDocumentEntity({
            displayName,
            email,
            photoURL,
            privateKey: keyPair.privateKey,
            initialized: true
        });
        await this._updateUserDocumentService.execute({
            userOperationRequest,
            userDocumentEntity
        });
        // Store public key in user public details
        userOperationRequest.setPublicKey(keyPair.publicKey);
        await this._updateUserPublicKeyService.execute({
            userOperationRequest
        });
    }
}