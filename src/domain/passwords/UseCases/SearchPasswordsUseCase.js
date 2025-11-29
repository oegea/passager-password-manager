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

import { PasswordsRequestsFactory } from '../Requests/factory.js';
import { FoldersRequestsFactory } from '../../folders/Requests/factory.js';

export class SearchPasswordsUseCase {
    constructor({ service, decryptService, subscribeToFoldersService, subscribeToPasswordsService }) {
        this._service = service;
        this._decryptService = decryptService;
        this._subscribeToFoldersService = subscribeToFoldersService;
        this._subscribeToPasswordsService = subscribeToPasswordsService;
        this._abortController = null;
    }

    async execute({ query, userId, userPrivateKey, onFolderResults, onSearchComplete }) {
        // Si hay una búsqueda en curso, la cancelamos
        if (this._abortController) {
            this._abortController.aborted = true;
        }

        // Creamos un nuevo controlador de aborto para esta búsqueda
        this._abortController = { aborted: false };
        const currentSearch = this._abortController;

        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            if (onSearchComplete) onSearchComplete();
            return;
        }

        try {
            // Primero obtenemos todas las carpetas
            const folders = await new Promise((resolve) => {
                this._subscribeToFoldersService.execute({
                    folderSubscriptionRequest: FoldersRequestsFactory.folderSubscriptionRequest({
                        userId,
                        onSubscriptionChanges: (folders) => {
                            resolve(folders);
                        },
                    }),
                });
            });

            // Procesamos cada carpeta
            for (const folder of folders) {
                // Verificamos si se ha cancelado la búsqueda
                if (currentSearch.aborted) {
                    return;
                }

                // Obtenemos las contraseñas de la carpeta
                const passwords = await new Promise((resolve) => {
                    this._subscribeToPasswordsService.execute({
                        passwordSubscriptionRequest: PasswordsRequestsFactory.passwordSubscriptionRequest({
                            folderId: folder.id,
                            userId,
                            onSubscriptionChanges: (passwords) => {
                                resolve(passwords);
                            },
                        }),
                    });
                });

                // Desciframos y filtramos las contraseñas que coincidan con la búsqueda
                const matchingPasswords = [];

                for (const password of passwords) {
                    if (currentSearch.aborted) {
                        return;
                    }

                    try {
                        const passwordOperationRequest = PasswordsRequestsFactory.passwordOperationRequest({
                            folderKey: folder.key,
                            password: password.password,
                            username: password.username,
                            userPrivateKey,
                        });

                        const decryptedPassword = await this._decryptService.execute({
                            passwordOperationRequest,
                        });

                        // Buscamos en el nombre/título, username y URL
                        const name = (password.name || '').toLowerCase();
                        const username = (decryptedPassword.username || '').toLowerCase();
                        const url = (password.url || '').toLowerCase();

                        if (
                            name.includes(normalizedQuery) ||
                            username.includes(normalizedQuery) ||
                            url.includes(normalizedQuery)
                        ) {
                            matchingPasswords.push({
                                ...password,
                                decryptedUsername: decryptedPassword.username,
                            });
                        }
                    } catch (error) {
                        // Si hay error al descifrar, simplemente omitimos esta contraseña
                        console.error('Error decrypting password:', error);
                    }
                }

                // Si hay contraseñas coincidentes, notificamos al callback
                if (matchingPasswords.length > 0 && onFolderResults) {
                    onFolderResults({
                        folder,
                        passwords: matchingPasswords,
                    });
                }
            }

            // Notificamos que la búsqueda ha terminado
            if (onSearchComplete && !currentSearch.aborted) {
                onSearchComplete();
            }
        } catch (error) {
            console.error('Error searching passwords:', error);
            if (onSearchComplete && !currentSearch.aborted) {
                onSearchComplete();
            }
        }
    }

    abort() {
        if (this._abortController) {
            this._abortController.aborted = true;
        }
    }
}
