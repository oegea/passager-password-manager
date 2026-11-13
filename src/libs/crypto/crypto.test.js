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

import {
    AESDecrypt,
    AESEncrypt,
    CURRENT_ENCRYPTION_VERSION,
    LEGACY_ENCRYPTION_VERSION,
    UnsupportedEncryptionVersionError,
    createExportableRSAKeyPair,
    decrypt,
    decryptPrivateKey,
    encrypt,
    generateExportableAESKey,
    getEncryptionVersion,
    importAESKey,
    importRSAKeyPair,
    importRSAPublicKey,
    needsEncryptionUpgrade,
    RSADecrypt,
    RSAEncrypt,
    upgradePrivateKeyEncryption,
} from './index.js';
// The exact library old Passager clients run, kept to prove compatibility
import * as oldClient from './__fixtures__/useful-tools-crypto-1.1.0.js';
// Data produced by an old Passager client
import legacy from './__fixtures__/legacy-v1.json';

const TIMEOUT = 60000;

describe('compatibility with data created by old clients', () => {
    test(
        'reads a legacy private key, folder key and password',
        async () => {
            expect(getEncryptionVersion(legacy.user.privateKey)).toBe(
                LEGACY_ENCRYPTION_VERSION
            );

            const keyPair = await importRSAKeyPair(
                legacy.user,
                legacy.masterPassword
            );
            const folderKey = await importAESKey(
                legacy.folderKey,
                keyPair.privateKey
            );

            expect(await AESDecrypt(legacy.password.username, folderKey)).toBe(
                legacy.plain.username
            );
            expect(await AESDecrypt(legacy.password.password, folderKey)).toBe(
                legacy.plain.password
            );
        },
        TIMEOUT
    );

    test(
        'rejects a wrong master password',
        async () => {
            await expect(
                importRSAKeyPair(legacy.user, 'not-the-password')
            ).rejects.toThrow();
        },
        TIMEOUT
    );
});

describe('compatibility of what this client creates with old clients', () => {
    test(
        'old clients read folder keys and passwords created here',
        async () => {
            // Keys of a user that still runs an old client
            const oldKeyPair = await oldClient.importRSAKeyPair(
                legacy.user,
                legacy.masterPassword
            );

            // This client creates a folder and a password for that user
            const publicKey = await importRSAPublicKey(legacy.user.publicKey);
            const encryptedFolderKey =
                await generateExportableAESKey(publicKey);
            const folderKey = await importAESKey(
                encryptedFolderKey,
                (await importRSAKeyPair(legacy.user, legacy.masterPassword))
                    .privateKey
            );
            const encryptedPassword = await AESEncrypt(
                'new-secret-€',
                folderKey
            );

            // The old client opens both
            const oldFolderKey = await oldClient.importAESKey(
                encryptedFolderKey,
                oldKeyPair.privateKey
            );
            expect(
                await oldClient.AESDecrypt(encryptedPassword, oldFolderKey)
            ).toBe('new-secret-€');

            // And this client opens what the old one writes in the same folder
            const oldEncryptedPassword = await oldClient.AESEncrypt(
                'old-secret',
                oldFolderKey
            );
            expect(await AESDecrypt(oldEncryptedPassword, folderKey)).toBe(
                'old-secret'
            );
        },
        TIMEOUT
    );

    test(
        'sharing a folder works in both directions',
        async () => {
            const newUser =
                await createExportableRSAKeyPair('New-User-Passw0rd!');
            const newUserKeys = await importRSAKeyPair(
                newUser,
                'New-User-Passw0rd!'
            );
            const oldUserKeys = await oldClient.importRSAKeyPair(
                legacy.user,
                legacy.masterPassword
            );

            // New client shares one of its folders with the old user
            const folderKeyOfNewUser = await generateExportableAESKey(
                newUserKeys.publicKey
            );
            const sharedWithOldUser = await RSAEncrypt(
                await RSADecrypt(folderKeyOfNewUser, newUserKeys.privateKey),
                await importRSAPublicKey(legacy.user.publicKey)
            );
            const aesKey = await importAESKey(
                folderKeyOfNewUser,
                newUserKeys.privateKey
            );
            const secret = await AESEncrypt('shared-secret', aesKey);
            const oldAesKey = await oldClient.importAESKey(
                sharedWithOldUser,
                oldUserKeys.privateKey
            );
            expect(await oldClient.AESDecrypt(secret, oldAesKey)).toBe(
                'shared-secret'
            );

            // Old client shares the legacy folder with the new user
            const sharedWithNewUser = await oldClient.RSAEncrypt(
                await oldClient.RSADecrypt(
                    legacy.folderKey,
                    oldUserKeys.privateKey
                ),
                await oldClient.importRSAPublicKey(newUser.publicKey)
            );
            const receivedKey = await importAESKey(
                sharedWithNewUser,
                newUserKeys.privateKey
            );
            expect(
                await AESDecrypt(legacy.password.password, receivedKey)
            ).toBe(legacy.plain.password);
        },
        TIMEOUT
    );

    test(
        'the legacy format can still be produced and old clients read it',
        async () => {
            const wrapped = await encrypt(
                'some text',
                'a password',
                LEGACY_ENCRYPTION_VERSION
            );
            expect(getEncryptionVersion(wrapped)).toBe(
                LEGACY_ENCRYPTION_VERSION
            );
            expect(await oldClient.decrypt(wrapped, 'a password')).toBe(
                'some text'
            );
        },
        TIMEOUT
    );
});

describe('encryption versions', () => {
    test('detects the version of a wrapped value', () => {
        expect(getEncryptionVersion('')).toBe(null);
        expect(getEncryptionVersion(null)).toBe(null);
        expect(getEncryptionVersion('c29tZXRoaW5n')).toBe(1);
        expect(getEncryptionVersion('pv2c29tZXRoaW5n')).toBe(1);
        expect(getEncryptionVersion('pv2.c29tZXRoaW5n')).toBe(2);
        expect(getEncryptionVersion('pv3.c29tZXRoaW5n')).toBe(3);
        expect(needsEncryptionUpgrade('c29tZXRoaW5n')).toBe(true);
        expect(needsEncryptionUpgrade('pv2.c29tZXRoaW5n')).toBe(false);
        expect(needsEncryptionUpgrade('pv3.c29tZXRoaW5n')).toBe(false);
        expect(needsEncryptionUpgrade('')).toBe(false);
    });

    test(
        'new keys use the current version and can be opened',
        async () => {
            const keyPair = await createExportableRSAKeyPair('My-Passw0rd!');
            expect(getEncryptionVersion(keyPair.privateKey)).toBe(
                CURRENT_ENCRYPTION_VERSION
            );
            expect(keyPair.privateKey.startsWith('pv2.')).toBe(true);

            const imported = await importRSAKeyPair(keyPair, 'My-Passw0rd!');
            const encrypted = await RSAEncrypt('hello', imported.publicKey);
            expect(await RSADecrypt(encrypted, imported.privateKey)).toBe(
                'hello'
            );

            await expect(importRSAKeyPair(keyPair, 'wrong')).rejects.toThrow();
        },
        TIMEOUT
    );

    test(
        'a value can not be moved from one version to another',
        async () => {
            const wrapped = await encrypt('some text', 'a password');
            // Without its marker it is read as legacy, and must not open
            await expect(
                decrypt(wrapped.replace('pv2.', ''), 'a password')
            ).rejects.toThrow();
        },
        TIMEOUT
    );

    test('reports values created by a newer version of Passager', async () => {
        await expect(
            decrypt('pv99.c29tZXRoaW5n', 'a password')
        ).rejects.toBeInstanceOf(UnsupportedEncryptionVersionError);
        await expect(
            encrypt('some text', 'a password', 99)
        ).rejects.toBeInstanceOf(UnsupportedEncryptionVersionError);
    });

    test(
        'old clients fail cleanly with upgraded keys, without damage',
        async () => {
            const upgraded = await upgradePrivateKeyEncryption(
                legacy.user.privateKey,
                legacy.masterPassword
            );
            await expect(
                oldClient.importRSAKeyPair(
                    { ...legacy.user, privateKey: upgraded },
                    legacy.masterPassword
                )
            ).rejects.toThrow();
        },
        TIMEOUT
    );
});

describe('private key upgrade', () => {
    test(
        'wraps a legacy key with the current version keeping the same key',
        async () => {
            const upgraded = await upgradePrivateKeyEncryption(
                legacy.user.privateKey,
                legacy.masterPassword
            );

            expect(getEncryptionVersion(upgraded)).toBe(
                CURRENT_ENCRYPTION_VERSION
            );
            expect(needsEncryptionUpgrade(upgraded)).toBe(false);
            expect(
                await decryptPrivateKey(upgraded, legacy.masterPassword)
            ).toBe(
                await decryptPrivateKey(
                    legacy.user.privateKey,
                    legacy.masterPassword
                )
            );

            // Everything the user already had keeps working with the new key
            const keyPair = await importRSAKeyPair(
                { ...legacy.user, privateKey: upgraded },
                legacy.masterPassword
            );
            const folderKey = await importAESKey(
                legacy.folderKey,
                keyPair.privateKey
            );
            expect(await AESDecrypt(legacy.password.password, folderKey)).toBe(
                legacy.plain.password
            );
        },
        TIMEOUT
    );

    test(
        'fails with a wrong password instead of producing a key',
        async () => {
            await expect(
                upgradePrivateKeyEncryption(legacy.user.privateKey, 'wrong')
            ).rejects.toThrow();
        },
        TIMEOUT
    );

    test(
        'refuses to wrap something that is not a private key',
        async () => {
            const notAKey = await encrypt(
                'not a key',
                'a password',
                LEGACY_ENCRYPTION_VERSION
            );
            await expect(
                upgradePrivateKeyEncryption(notAKey, 'a password')
            ).rejects.toThrow();
        },
        TIMEOUT
    );
});
