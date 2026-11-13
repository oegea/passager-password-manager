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
    BiometricCancelledError,
    BiometricStaleError,
    BiometricUnavailableError,
    clearBiometricData,
    declineBiometric,
    enrollBiometric,
    fromBase64Url,
    getBiometricAvailability,
    getEnrollment,
    hasDeclinedBiometric,
    hasEnrollment,
    isEnrollment,
    toBase64Url,
    unlockWithBiometric,
    unwrapPrivateKey,
    wrapPrivateKey,
} from './biometric.js';

const PRIVATE_KEY = JSON.stringify({ kty: 'RSA', d: 'secret-ñ-€', n: 'abc' });
const randomBytes = (length) =>
    globalThis.crypto.getRandomValues(new Uint8Array(length));

/**
 * A minimal platform authenticator with the PRF extension: the secret only
 * depends on the credential and the salt, like a real one.
 */
const installFakeAuthenticator = ({
    prfOnCreate = false,
    prfEnabled = true,
    capabilities = { 'extension:prf': true },
} = {}) => {
    const credentials = new Map();
    const prf = async (seed, salt) =>
        globalThis.crypto.subtle.digest(
            'SHA-256',
            new Uint8Array([...seed, ...new Uint8Array(salt)])
        );

    const create = vi.fn(async ({ publicKey }) => {
        const rawId = randomBytes(16);
        const seed = randomBytes(32);
        credentials.set(toBase64Url(rawId), seed);
        const first = await prf(seed, publicKey.extensions.prf.eval.first);
        return {
            rawId: rawId.buffer,
            getClientExtensionResults: () => ({
                prf: {
                    enabled: prfEnabled,
                    ...(prfOnCreate ? { results: { first } } : {}),
                },
            }),
        };
    });

    const get = vi.fn(async ({ publicKey }) => {
        const id = toBase64Url(
            new Uint8Array(publicKey.allowCredentials[0].id)
        );
        const seed = credentials.get(id);
        if (!seed) {
            throw new DOMException('Unknown credential', 'NotAllowedError');
        }
        const first = await prf(seed, publicKey.extensions.prf.eval.first);
        return {
            getClientExtensionResults: () => ({ prf: { results: { first } } }),
        };
    });

    Object.defineProperty(window, 'isSecureContext', {
        value: true,
        configurable: true,
    });
    window.PublicKeyCredential = {
        isUserVerifyingPlatformAuthenticatorAvailable: async () => true,
        getClientCapabilities: capabilities
            ? async () => capabilities
            : undefined,
    };
    Object.defineProperty(navigator, 'credentials', {
        value: { create, get },
        configurable: true,
    });

    return { create, get, credentials };
};

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    delete window.PublicKeyCredential;
});

describe('wrapping the private key', () => {
    test('wraps and unwraps with the same secret', async () => {
        const secret = randomBytes(32);
        const enrollment = await wrapPrivateKey({
            secret: secret.slice(),
            privateKeyJwk: PRIVATE_KEY,
            credId: 'Y3JlZA',
            prfSalt: 'c2FsdA',
            owner: 'user-1',
        });

        expect(isEnrollment(enrollment)).toBe(true);
        // Nothing readable is stored
        expect(JSON.stringify(enrollment)).not.toContain('secret-');

        expect(
            await unwrapPrivateKey({ secret: secret.slice(), enrollment })
        ).toBe(PRIVATE_KEY);
    });

    test('erases the secret after using it', async () => {
        const secret = randomBytes(32);
        await wrapPrivateKey({
            secret,
            privateKeyJwk: PRIVATE_KEY,
            credId: 'Y3JlZA',
            prfSalt: 'c2FsdA',
            owner: 'user-1',
        });
        expect(secret.every((byte) => byte === 0)).toBe(true);
    });

    test('does not open with another secret, credential or owner', async () => {
        const secret = randomBytes(32);
        const enrollment = await wrapPrivateKey({
            secret: secret.slice(),
            privateKeyJwk: PRIVATE_KEY,
            credId: 'Y3JlZA',
            prfSalt: 'c2FsdA',
            owner: 'user-1',
        });

        await expect(
            unwrapPrivateKey({ secret: randomBytes(32), enrollment })
        ).rejects.toBeInstanceOf(BiometricStaleError);
        await expect(
            unwrapPrivateKey({
                secret: secret.slice(),
                enrollment: { ...enrollment, credId: 'b3RoZXI' },
            })
        ).rejects.toBeInstanceOf(BiometricStaleError);
        await expect(
            unwrapPrivateKey({
                secret: secret.slice(),
                enrollment: { ...enrollment, owner: 'user-2' },
            })
        ).rejects.toBeInstanceOf(BiometricStaleError);
        await expect(
            unwrapPrivateKey({ secret: secret.slice(), enrollment: {} })
        ).rejects.toBeInstanceOf(BiometricStaleError);
    });

    test('base64url round trip', () => {
        const bytes = randomBytes(33);
        expect(fromBase64Url(toBase64Url(bytes))).toEqual(bytes);
        expect(toBase64Url(bytes)).toMatch(/^[A-Za-z0-9_-]+$/);
    });
});

describe('availability', () => {
    test('is not available without WebAuthn', async () => {
        expect(await getBiometricAvailability()).toBe('no');
    });

    test('depends on what the browser declares', async () => {
        installFakeAuthenticator();
        expect(await getBiometricAvailability()).toBe('yes');

        installFakeAuthenticator({ capabilities: { 'extension:prf': false } });
        expect(await getBiometricAvailability()).toBe('no');

        installFakeAuthenticator({ capabilities: null });
        expect(await getBiometricAvailability()).toBe('maybe');
    });
});

describe('enrolling and unlocking', () => {
    test.each([{ prfOnCreate: true }, { prfOnCreate: false }])(
        'enrolls and unlocks (secret returned on creation: $prfOnCreate)',
        async ({ prfOnCreate }) => {
            const authenticator = installFakeAuthenticator({ prfOnCreate });

            await enrollBiometric({
                owner: 'user-1',
                displayName: 'user@example.com',
                getPrivateKeyJwk: async () => PRIVATE_KEY,
            });

            const options = authenticator.create.mock.calls[0][0].publicKey;
            expect(options.authenticatorSelection).toEqual({
                authenticatorAttachment: 'platform',
                residentKey: 'required',
                userVerification: 'required',
            });
            expect(options.rp.id).toBe(window.location.hostname);
            expect(authenticator.get).toHaveBeenCalledTimes(
                prfOnCreate ? 0 : 1
            );

            expect(hasEnrollment('user-1')).toBe(true);
            expect(hasEnrollment('user-2')).toBe(false);
            expect(localStorage.getItem('biometricEnrollment')).not.toContain(
                'secret-'
            );

            expect(await unlockWithBiometric('user-1')).toBe(PRIVATE_KEY);
            const request = authenticator.get.mock.calls.at(-1)[0].publicKey;
            expect(request.userVerification).toBe('required');
        }
    );

    test('keeps one passkey per installation', async () => {
        const authenticator = installFakeAuthenticator();
        const enroll = () =>
            enrollBiometric({
                owner: 'user-1',
                getPrivateKeyJwk: async () => PRIVATE_KEY,
            });
        await enroll();
        await enroll();
        const [first, second] = authenticator.create.mock.calls.map((call) =>
            toBase64Url(new Uint8Array(call[0].publicKey.user.id))
        );
        expect(first).toBe(second);
    });

    test('does not enroll when the private key can not be obtained', async () => {
        installFakeAuthenticator();
        await expect(
            enrollBiometric({
                owner: 'user-1',
                getPrivateKeyJwk: async () => {
                    throw new Error('Decryption failed');
                },
            })
        ).rejects.toThrow('Decryption failed');
        expect(hasEnrollment('user-1')).toBe(false);
    });

    test('reports authenticators without PRF', async () => {
        installFakeAuthenticator({ prfEnabled: false });
        await expect(
            enrollBiometric({
                owner: 'user-1',
                getPrivateKeyJwk: async () => PRIVATE_KEY,
            })
        ).rejects.toBeInstanceOf(BiometricUnavailableError);
        expect(hasEnrollment('user-1')).toBe(false);
    });

    test('a cancelled request is not an error of the device', async () => {
        const authenticator = installFakeAuthenticator();
        authenticator.create.mockRejectedValueOnce(
            new DOMException('Cancelled', 'NotAllowedError')
        );
        await expect(
            enrollBiometric({
                owner: 'user-1',
                getPrivateKeyJwk: async () => PRIVATE_KEY,
            })
        ).rejects.toBeInstanceOf(BiometricCancelledError);

        await enrollBiometric({
            owner: 'user-1',
            getPrivateKeyJwk: async () => PRIVATE_KEY,
        });
        authenticator.get.mockRejectedValueOnce(
            new DOMException('Cancelled', 'NotAllowedError')
        );
        await expect(unlockWithBiometric('user-1')).rejects.toBeInstanceOf(
            BiometricCancelledError
        );
        // The enrollment is still there for the next attempt
        expect(await unlockWithBiometric('user-1')).toBe(PRIVATE_KEY);
    });

    test('an enrollment restored in another device does not open', async () => {
        installFakeAuthenticator();
        await enrollBiometric({
            owner: 'user-1',
            getPrivateKeyJwk: async () => PRIVATE_KEY,
        });
        // Same stored data, different authenticator
        installFakeAuthenticator();
        await expect(unlockWithBiometric('user-1')).rejects.toBeInstanceOf(
            BiometricCancelledError
        );
    });

    test('can not unlock without an enrollment of that user', async () => {
        installFakeAuthenticator();
        await expect(unlockWithBiometric('user-1')).rejects.toBeInstanceOf(
            BiometricUnavailableError
        );
    });

    test('remembers a declined offer per user and clears everything', async () => {
        installFakeAuthenticator();
        declineBiometric('user-1');
        expect(hasDeclinedBiometric('user-1')).toBe(true);
        expect(hasDeclinedBiometric('user-2')).toBe(false);

        await enrollBiometric({
            owner: 'user-1',
            getPrivateKeyJwk: async () => PRIVATE_KEY,
        });
        expect(hasDeclinedBiometric('user-1')).toBe(false);
        expect(getEnrollment('user-1')).not.toBe(null);

        clearBiometricData();
        expect(hasEnrollment('user-1')).toBe(false);
    });
});
