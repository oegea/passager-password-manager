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

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import legacy from '../libs/crypto/__fixtures__/legacy-v1.json';
import {
    createExportableRSAKeyPair,
    decryptPrivateKey,
    getEncryptionVersion,
} from '../libs/crypto/index.js';

// The provider awaits its own state updates. Inside React's `act` those are
// only flushed when the callback ends, so it is not used here.
const act = async (callback) => callback();

const TIMEOUT = 90000;
const EMAIL = 'user@example.com';

/**
 * In-memory stand-in for the documents service, as strict as the real one:
 * user documents only accept the exact fields old and new backends allow.
 */
const backend = vi.hoisted(() => {
    const USER_FIELDS = [
        'displayName',
        'email',
        'initialized',
        'photoURL',
        'privateKey',
    ];
    const state = { collections: {}, patches: [] };
    const getCollection = (name) =>
        (state.collections[name] = state.collections[name] || []);
    const matches = (document, criteria) =>
        Object.keys(criteria).every((key) => document[key] === criteria[key]);
    const api = {
        state,
        reset: () => {
            state.collections = {};
            state.patches = [];
        },
        findDocument: async (collection, criteria) =>
            getCollection(collection).filter((d) => matches(d, criteria)),
        getDocument: async (collection, id) =>
            getCollection(collection).find((d) => d.id === id) || null,
        createDocument: async (collection, document) => {
            const created = { ...document, id: `id-${Math.random()}` };
            getCollection(collection).push(created);
            return created;
        },
        updateDocument: async (collection, id, document) => {
            const payload = JSON.parse(JSON.stringify(document));
            if (collection === 'users') {
                const fields = Object.keys(payload).sort();
                if (JSON.stringify(fields) !== JSON.stringify(USER_FIELDS))
                    return null; // Rejected, exactly like the real backend
            }
            const existing = getCollection(collection).find((d) => d.id === id);
            if (!existing) return null;
            Object.assign(existing, payload);
            state.patches.push({ collection, payload });
            return existing;
        },
        setDocument: async (collection, document, criteria) => {
            const found = await api.findDocument(collection, criteria);
            if (found.length > 0)
                return api.updateDocument(collection, found[0].id, {
                    ...found[0],
                    ...document,
                    id: undefined,
                });
            return api.createDocument(collection, document);
        },
        retrieveServiceData: () => ({
            documentsUrl: 'http://backend.test/',
            jwtToken: 'token',
            decodedJwtToken: { email: 'user@example.com' },
        }),
        isBackendMode: () => localStorage.getItem('storeMode') === 'BACKEND',
    };
    return api;
});

vi.mock('../libs/backend.js', () => backend);

const seedLocalVault = (privateKey = legacy.user.privateKey) => {
    localStorage.setItem('storeMode', 'LOCAL');
    localStorage.setItem(
        'auth',
        JSON.stringify({
            email: '',
            displayName: 'Local user',
            photoURL: '',
            initialized: false,
            privateKey: '',
            uid: 'local-uid',
        })
    );
    localStorage.setItem(
        'users',
        JSON.stringify([
            {
                uid: 'local-uid',
                email: '',
                displayName: 'Local user',
                photoURL: '',
                initialized: true,
                privateKey,
                id: 'abc',
            },
        ])
    );
    localStorage.setItem(
        'userSharingSettings',
        JSON.stringify([
            {
                uid: 'local-uid',
                publicKey: legacy.user.publicKey,
                email: '',
                id: 'def',
            },
        ])
    );
};

const seedBackendVault = ({ privateKey = legacy.user.privateKey } = {}) => {
    localStorage.setItem('storeMode', 'BACKEND');
    backend.state.collections.users = [
        {
            id: 'user-id',
            email: EMAIL,
            displayName: EMAIL,
            photoURL: '',
            initialized: true,
            privateKey,
        },
    ];
    backend.state.collections.userSharingSettings = [
        { id: 'sharing-id', email: EMAIL, publicKey: legacy.user.publicKey },
    ];
};

/** Mounts the provider with a fresh copy of every module. */
const mountProvider = async () => {
    vi.resetModules();
    const { default: UserProvider, UserContext } =
        await import('./UserProvider.js');
    const current = { user: null };
    const Consumer = () => {
        current.user = React.useContext(UserContext);
        return null;
    };
    const view = render(
        <UserProvider>
            <Consumer />
        </UserProvider>
    );
    await waitFor(() => expect(current.user).not.toBe(null), {
        timeout: 5000,
    });
    return { current, view };
};

const storedLocalKey = () => JSON.parse(localStorage.getItem('users'))[0];
const storedBackendKey = () => backend.state.collections.users[0].privateKey;

beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});

afterAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
    localStorage.clear();
    backend.reset();
});

describe('unlocking', () => {
    test(
        'rejects a wrong master password and changes nothing',
        async () => {
            seedLocalVault();
            const { current } = await mountProvider();

            let result;
            await act(async () => {
                result = await current.user.decryptPrivateKey('wrong', false);
            });

            expect(result).toBe(false);
            expect(current.user.decryptedPrivateKey).toBe(false);
            expect(storedLocalKey().privateKey).toBe(legacy.user.privateKey);
        },
        TIMEOUT
    );
});

describe('encryption upgrade in local mode', () => {
    test(
        'upgrades a legacy key transparently after unlocking',
        async () => {
            seedLocalVault();
            const { current } = await mountProvider();
            expect(current.user.decryptedPrivateKey).toBe(false);

            let result;
            await act(async () => {
                result = await current.user.decryptPrivateKey(
                    legacy.masterPassword,
                    false
                );
            });
            expect(result).toBe(true);
            expect(current.user.decryptedPrivateKey).toBe(true);

            await waitFor(
                () =>
                    expect(
                        getEncryptionVersion(storedLocalKey().privateKey)
                    ).toBe(2),
                { timeout: 30000 }
            );

            // Same private key, same document, public key untouched
            const stored = storedLocalKey();
            expect(
                await decryptPrivateKey(
                    stored.privateKey,
                    legacy.masterPassword
                )
            ).toBe(
                await decryptPrivateKey(
                    legacy.user.privateKey,
                    legacy.masterPassword
                )
            );
            expect(stored).toMatchObject({
                uid: 'local-uid',
                initialized: true,
                id: 'abc',
            });
            expect(
                JSON.parse(localStorage.getItem('userSharingSettings'))[0]
                    .publicKey
            ).toBe(legacy.user.publicKey);
            await waitFor(() =>
                expect(current.user.encryptedPrivateKey).toBe(stored.privateKey)
            );
        },
        TIMEOUT
    );

    test(
        'the upgraded vault opens again, and is not upgraded twice',
        async () => {
            seedLocalVault();
            const first = await mountProvider();
            await act(async () => {
                await first.current.user.decryptPrivateKey(
                    legacy.masterPassword,
                    false
                );
            });
            await waitFor(
                () =>
                    expect(
                        getEncryptionVersion(storedLocalKey().privateKey)
                    ).toBe(2),
                { timeout: 30000 }
            );
            const upgraded = storedLocalKey().privateKey;
            first.view.unmount();

            const second = await mountProvider();
            let result;
            await act(async () => {
                result = await second.current.user.decryptPrivateKey(
                    legacy.masterPassword,
                    false
                );
            });
            expect(result).toBe(true);
            await new Promise((resolve) => setTimeout(resolve, 300));
            expect(storedLocalKey().privateKey).toBe(upgraded);
        },
        TIMEOUT
    );
});

describe('encryption upgrade in organization mode', () => {
    test(
        'upgrades a legacy key transparently after unlocking',
        async () => {
            seedBackendVault();
            const { current } = await mountProvider();

            await act(async () => {
                await current.user.decryptPrivateKey(
                    legacy.masterPassword,
                    false
                );
            });
            expect(current.user.decryptedPrivateKey).toBe(true);

            await waitFor(
                () => expect(getEncryptionVersion(storedBackendKey())).toBe(2),
                { timeout: 30000 }
            );
            await waitFor(() =>
                expect(current.user.encryptedPrivateKey).toBe(
                    storedBackendKey()
                )
            );

            // The document sent is one that every backend version accepts
            expect(backend.state.patches).toHaveLength(1);
            expect(
                Object.keys(backend.state.patches[0].payload).sort()
            ).toEqual([
                'displayName',
                'email',
                'initialized',
                'photoURL',
                'privateKey',
            ]);
            // Same private key, only wrapped again
            expect(
                await decryptPrivateKey(
                    storedBackendKey(),
                    legacy.masterPassword
                )
            ).toBe(
                await decryptPrivateKey(
                    legacy.user.privateKey,
                    legacy.masterPassword
                )
            );
            // The public key other users share folders with is untouched
            expect(
                backend.state.collections.userSharingSettings[0].publicKey
            ).toBe(legacy.user.publicKey);
        },
        TIMEOUT
    );

    test(
        'a key kept only in this device is upgraded in this device',
        async () => {
            // "Increased security mode": the server holds no private key
            seedBackendVault({ privateKey: '' });
            localStorage.setItem(
                'privateUserKey',
                JSON.stringify({
                    owner: EMAIL,
                    privateKey: legacy.user.privateKey,
                })
            );
            const { current } = await mountProvider();
            expect(current.user.isPrivateKeyStoredLocally).toBe(true);

            await act(async () => {
                await current.user.decryptPrivateKey(
                    legacy.masterPassword,
                    false
                );
            });
            await waitFor(
                () =>
                    expect(
                        getEncryptionVersion(
                            JSON.parse(localStorage.getItem('privateUserKey'))
                                .privateKey
                        )
                    ).toBe(2),
                { timeout: 30000 }
            );
            expect(
                JSON.parse(localStorage.getItem('privateUserKey')).owner
            ).toBe(EMAIL);
            // The server is not touched
            expect(storedBackendKey()).toBe('');
            expect(backend.state.patches).toHaveLength(0);
        },
        TIMEOUT
    );

    test(
        'keeps the legacy key if the backend does not store the new one',
        async () => {
            seedBackendVault();
            const { current } = await mountProvider();
            const failingUpdate = vi
                .spyOn(backend, 'updateDocument')
                .mockResolvedValue(null);

            await act(async () => {
                await current.user.decryptPrivateKey(
                    legacy.masterPassword,
                    false
                );
            });
            await waitFor(() => expect(failingUpdate).toHaveBeenCalled(), {
                timeout: 30000,
            });
            await new Promise((resolve) => setTimeout(resolve, 300));

            expect(storedBackendKey()).toBe(legacy.user.privateKey);
            expect(current.user.encryptedPrivateKey).toBe(
                legacy.user.privateKey
            );
            expect(current.user.decryptedPrivateKey).toBe(true);
            failingUpdate.mockRestore();
        },
        TIMEOUT
    );
});

describe('accounts created with this version', () => {
    test(
        'are left as they are',
        async () => {
            const keyPair = await createExportableRSAKeyPair('New-Passw0rd!');
            seedBackendVault({ privateKey: keyPair.privateKey });
            backend.state.collections.userSharingSettings[0].publicKey =
                keyPair.publicKey;
            const { current } = await mountProvider();
            await act(async () => {
                await current.user.decryptPrivateKey('New-Passw0rd!', false);
            });
            expect(current.user.decryptedPrivateKey).toBe(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            expect(storedBackendKey()).toBe(keyPair.privateKey);
        },
        TIMEOUT
    );
});
