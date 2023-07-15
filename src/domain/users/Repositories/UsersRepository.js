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

export default class UsersRepository {
    /**
     * Gets public details of a user
     */
    async getUserPublicDetails() {
        throw new Error(
            '[UsersRepository][getUserPublicDetails] is not implemented yet'
        );
    }

    /**
     * Updates public key of a user
     */
    async updateUserPublicKey() {
        throw new Error(
            '[UsersRepository][updateUserPublicKey] is not implemented yet'
        );
    }

    /**
     * Updates private key of a user
     */
    async updateUserPrivateKey() {
        throw new Error(
            '[UsersRepository][updateUserPrivateKey] is not implemented yet'
        );
    }

    /**
     * Gets the user document by uid
     */
    async getUserDocumentByUid() {
        throw new Error(
            '[UsersRepository][getUserDocumentByUid] is not implemented yet'
        );
    }

    /**
     * Updates or sets a user's document
     */
    async updateUserDocument() {
        throw new Error(
            '[UsersRepository][updateUserDocument] is not implemented yet'
        );
    }

    /**
     * Subscription to auth status (login or logout)
     */
    async subscribeToAuthStateChange() {
        throw new Error(
            '[UsersRepository][subscribeToAuthStateChange] is not implemented yet'
        );
    }
}
