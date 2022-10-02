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

import { FolderOperationRequest } from './FolderOperationRequest.js';
import { FolderReferenceRequest } from './FolderReferenceRequest.js';
import { FolderSubscriptionRequest } from './FolderSubscriptionRequest.js';
import { FolderShareRequest } from './FolderShareRequest.js';

export class FoldersRequestsFactory {
    static folderOperationRequest = ({
        id,
        folderKey,
        name,
        owner,
        publicKey,
    }) => {
        return new FolderOperationRequest({
            id,
            folderKey,
            name,
            owner,
            publicKey,
        });
    };

    static folderReferenceRequest = ({ id }) => {
        return new FolderReferenceRequest({ id });
    };

    static folderSubscriptionRequest = ({ onSubscriptionChanges, userId }) => {
        return new FolderSubscriptionRequest({ onSubscriptionChanges, userId });
    };

    static folderShareRequest = ({
        folderName,
        folderId,
        folderKey,
        email,
        emailList,
        userPrivateKey,
    }) => {
        return new FolderShareRequest({
            folderName,
            folderId,
            folderKey,
            email,
            emailList,
            userPrivateKey,
        });
    };
}
