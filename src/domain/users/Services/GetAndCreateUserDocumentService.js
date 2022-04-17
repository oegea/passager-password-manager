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

 export class GetAndCreateUserDocumentService {
    constructor({
        repository,
        userDocumentEntity,
        updateUserDocumentService
    }) {
        this._repository = repository;
        this._userDocumentEntity = userDocumentEntity;
        this._updateUserDocumentService = updateUserDocumentService;
    }

    async execute({userOperationRequest}) {
        // Retrieve email, displayName, photoURL
        const email = userOperationRequest.getEmail();
        const displayName = userOperationRequest.getDisplayName();
        const photoURL = userOperationRequest.getPhotoURL();
        // Retrieve current user document
        const getUserDocumentResult = await this._repository.getUserDocumentByUid({ userOperationRequest });
        // If exists, return
        if (getUserDocumentResult !== null) {
            return getUserDocumentResult;
        }
        // If not, create and return
        let userDocumentEntity = this._userDocumentEntity({
            email, displayName, photoURL
        }); 
        await this._updateUserDocumentService.execute({
            userOperationRequest,
            userDocumentEntity
        });

        const uid = userOperationRequest.getUid();
        const initializedUserDocument = userDocumentEntity.toJSON();
        return {uid, ...initializedUserDocument};
    }
}