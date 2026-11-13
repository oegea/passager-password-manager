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

/**
 * Biometric unlock (Face ID, Touch ID, fingerprint, Windows Hello...).
 *
 * How it works. WebAuthn on its own only produces signatures, which are
 * useless to decrypt anything without a server. The PRF extension is used
 * instead: the platform authenticator derives a 32 byte secret that is only
 * released after verifying the person (biometrics or the device PIN) and is
 * never stored. An AES-256-GCM key is derived from that secret with HKDF and
 * wraps the user's private key. Only the wrapped key and public metadata
 * (credential id, salts, IV) are kept in this device.
 *
 * What it does NOT do. The master password is never stored, and nothing is
 * sent to any server. The master password remains the only way to open the
 * vault in another device.
 */

export const BIOMETRIC_VERSION = 1;
const ENROLLMENT_STORAGE_KEY = 'biometricEnrollment';
const USER_ID_STORAGE_KEY = 'biometricUserId';
const DECLINED_STORAGE_KEY = 'biometricDeclined';
const HKDF_INFO = new TextEncoder().encode('passager/biometric-wrap/v1');
const RP_NAME = 'Passager';

export class BiometricUnavailableError extends Error {
    constructor(message = 'Biometric unlock is not available') {
        super(message);
        this.name = 'BiometricUnavailableError';
    }
}

/** The person cancelled, or the browser did not allow the attempt. */
export class BiometricCancelledError extends Error {
    constructor(message = 'Biometric attempt cancelled') {
        super(message);
        this.name = 'BiometricCancelledError';
    }
}

/** The stored enrollment can no longer open the vault. */
export class BiometricStaleError extends Error {
    constructor(message = 'Biometric enrollment is no longer valid') {
        super(message);
        this.name = 'BiometricStaleError';
    }
}

// #region Utilities
export const toBase64Url = (bytes) => {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export const fromBase64Url = (text) => {
    const padding =
        text.length % 4 === 0 ? '' : '='.repeat(4 - (text.length % 4));
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/') + padding);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

const random = (length) =>
    globalThis.crypto.getRandomValues(new Uint8Array(length));

const isBase64Url = (value) =>
    typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value);

/** Additional data: ties the wrapped key to the credential, owner and version. */
const getAdditionalData = (credId, owner) =>
    new TextEncoder().encode(
        `passager-biometric:${BIOMETRIC_VERSION}:${credId}:${owner}`
    );

/** Non extractable AES-GCM key derived from the PRF secret. */
const getWrappingKey = async (secret, hkdfSalt) => {
    try {
        const keyMaterial = await globalThis.crypto.subtle.importKey(
            'raw',
            secret,
            'HKDF',
            false,
            ['deriveKey']
        );
        return await globalThis.crypto.subtle.deriveKey(
            { name: 'HKDF', hash: 'SHA-256', salt: hkdfSalt, info: HKDF_INFO },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    } finally {
        secret.fill(0);
    }
};
// #endregion

// #region Wrapping (pure functions, no WebAuthn involved)
export const isEnrollment = (value) => {
    if (!value || typeof value !== 'object') return false;
    return (
        value.v === BIOMETRIC_VERSION &&
        typeof value.owner === 'string' &&
        isBase64Url(value.credId) &&
        isBase64Url(value.prfSalt) &&
        isBase64Url(value.hkdfSalt) &&
        isBase64Url(value.iv) &&
        isBase64Url(value.wrapped)
    );
};

/**
 * Wraps the plain private key (JWK as a JSON string) with the PRF secret.
 * The secret is always erased.
 */
export const wrapPrivateKey = async ({
    secret,
    privateKeyJwk,
    credId,
    prfSalt,
    owner,
}) => {
    const hkdfSalt = random(32);
    const iv = random(12);
    const key = await getWrappingKey(secret, hkdfSalt);
    const wrapped = new Uint8Array(
        await globalThis.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData: getAdditionalData(credId, owner),
            },
            key,
            new TextEncoder().encode(privateKeyJwk)
        )
    );
    return {
        v: BIOMETRIC_VERSION,
        owner,
        credId,
        prfSalt,
        hkdfSalt: toBase64Url(hkdfSalt),
        iv: toBase64Url(iv),
        wrapped: toBase64Url(wrapped),
        createdAt: Date.now(),
    };
};

/**
 * Unwraps the private key. Throws if the secret is not the one that wrapped
 * it. The secret is always erased.
 */
export const unwrapPrivateKey = async ({ secret, enrollment }) => {
    if (!isEnrollment(enrollment)) {
        secret.fill(0);
        throw new BiometricStaleError();
    }
    const key = await getWrappingKey(
        secret,
        fromBase64Url(enrollment.hkdfSalt)
    );
    try {
        const plain = await globalThis.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: fromBase64Url(enrollment.iv),
                additionalData: getAdditionalData(
                    enrollment.credId,
                    enrollment.owner
                ),
            },
            key,
            fromBase64Url(enrollment.wrapped)
        );
        return new TextDecoder().decode(plain);
    } catch (e) {
        throw new BiometricStaleError();
    }
};
// #endregion

// #region Local storage of the enrollment
const readJson = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        return null;
    }
};

/** Returns the enrollment stored in this device for a user, if any. */
export const getEnrollment = (owner) => {
    const enrollment = readJson(ENROLLMENT_STORAGE_KEY);
    if (!isEnrollment(enrollment) || enrollment.owner !== owner) return null;
    return enrollment;
};

export const hasEnrollment = (owner) => getEnrollment(owner) !== null;

export const removeEnrollment = () => {
    localStorage.removeItem(ENROLLMENT_STORAGE_KEY);
};

export const declineBiometric = (owner) => {
    localStorage.setItem(DECLINED_STORAGE_KEY, JSON.stringify({ owner }));
};

export const hasDeclinedBiometric = (owner) => {
    const declined = readJson(DECLINED_STORAGE_KEY);
    return declined !== null && declined.owner === owner;
};

/** Removes every trace of the biometric unlock from this device. */
export const clearBiometricData = () => {
    localStorage.removeItem(ENROLLMENT_STORAGE_KEY);
    localStorage.removeItem(DECLINED_STORAGE_KEY);
};

/**
 * A fixed random user id per installation, so the system replaces the
 * previous passkey instead of piling up orphaned ones.
 */
const getInstallationUserId = () => {
    const stored = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (isBase64Url(stored)) return fromBase64Url(stored);
    const userId = random(16);
    localStorage.setItem(USER_ID_STORAGE_KEY, toBase64Url(userId));
    return userId;
};
// #endregion

// #region WebAuthn
const getRpId = () => window.location.hostname;

/** Name of the method for UI texts, depending on the device. */
export const getBiometricMethodName = () => {
    const userAgent = navigator.userAgent || '';
    if (/iPhone|iPad|Macintosh/.test(userAgent)) return 'Face ID / Touch ID';
    if (/Windows/.test(userAgent)) return 'Windows Hello';
    return 'biometrics';
};

/**
 * Whether this browser can offer the biometric unlock, and why not.
 *
 * - 'yes': secure context, platform authenticator with user verification and
 *   PRF support declared by the browser. It is offered after signing in.
 * - 'maybe': there is a platform authenticator, but the browser does not
 *   declare PRF support (older versions do not say, and some say "no" while
 *   supporting it). It is not offered automatically; it can be tried from
 *   the profile, and it is checked when the credential is created.
 * - 'no': it can not work here. `reason` says why:
 *   'insecure-context', 'no-webauthn' or 'no-authenticator'.
 */
export const getBiometricSupport = async () => {
    if (typeof window === 'undefined' || !window.isSecureContext)
        return { availability: 'no', reason: 'insecure-context' };
    if (!('PublicKeyCredential' in window) || !navigator.credentials)
        return { availability: 'no', reason: 'no-webauthn' };

    const PublicKeyCredential = window.PublicKeyCredential;
    try {
        if (
            !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
        )
            return { availability: 'no', reason: 'no-authenticator' };
    } catch (e) {
        return { availability: 'no', reason: 'no-authenticator' };
    }

    try {
        if (typeof PublicKeyCredential.getClientCapabilities === 'function') {
            const capabilities =
                await PublicKeyCredential.getClientCapabilities();
            if (capabilities && capabilities['extension:prf'] === true)
                return { availability: 'yes', reason: null };
        }
    } catch (e) {
        // Not being able to ask is the same as not being told
    }
    return { availability: 'maybe', reason: 'prf-not-declared' };
};

export const getBiometricAvailability = async () =>
    (await getBiometricSupport()).availability;

const isCancellation = (error) =>
    error && (error.name === 'NotAllowedError' || error.name === 'AbortError');

const toSecret = (value) => {
    // A copy, so erasing it later never touches the authenticator's buffer.
    // `instanceof ArrayBuffer` is avoided: it fails across realms.
    const secret = ArrayBuffer.isView(value)
        ? new Uint8Array(
              value.buffer.slice(
                  value.byteOffset,
                  value.byteOffset + value.byteLength
              )
          )
        : new Uint8Array(value).slice();
    if (secret.length < 32) {
        secret.fill(0);
        throw new BiometricUnavailableError('PRF secret is too short');
    }
    return secret;
};

/** Asks the authenticator for the PRF secret of a credential. */
const getPrfSecret = async (credId, prfSalt, signal) => {
    let credential;
    try {
        credential = await navigator.credentials.get({
            signal,
            publicKey: {
                challenge: random(32),
                rpId: getRpId(),
                allowCredentials: [
                    {
                        id: credId,
                        type: 'public-key',
                        transports: ['internal'],
                    },
                ],
                userVerification: 'required',
                timeout: 60000,
                extensions: { prf: { eval: { first: prfSalt } } },
            },
        });
    } catch (e) {
        if (isCancellation(e)) throw new BiometricCancelledError();
        throw e;
    }
    if (!credential) throw new BiometricCancelledError();
    const results = credential.getClientExtensionResults();
    const first =
        results && results.prf && results.prf.results
            ? results.prf.results.first
            : undefined;
    if (!first)
        throw new BiometricUnavailableError(
            'The authenticator did not return the secret'
        );
    return toSecret(first);
};

/**
 * Enables the biometric unlock in this device: creates (or replaces) the
 * platform passkey with PRF, asks for the secret and wraps the private key.
 *
 * Must be called from a user gesture (a click).
 *
 * @param {object} params
 * @param {string} params.owner Identifier of the user (uid)
 * @param {string} params.displayName Name shown by the system for the passkey
 * @param {Function} params.getPrivateKeyJwk Async function returning the plain
 * private key (JWK as JSON string). It is called after the passkey has been
 * created, so the user gesture is not lost while deriving keys.
 */
export const enrollBiometric = async ({
    owner,
    displayName,
    getPrivateKeyJwk,
}) => {
    if ((await getBiometricAvailability()) === 'no')
        throw new BiometricUnavailableError();

    const prfSalt = random(32);
    let credential;
    try {
        credential = await navigator.credentials.create({
            publicKey: {
                rp: { name: RP_NAME, id: getRpId() },
                user: {
                    id: getInstallationUserId(),
                    name: displayName || RP_NAME,
                    displayName: displayName || RP_NAME,
                },
                challenge: random(32),
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 },
                    { type: 'public-key', alg: -257 },
                ],
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    residentKey: 'required',
                    userVerification: 'required',
                },
                attestation: 'none',
                timeout: 60000,
                extensions: { prf: { eval: { first: prfSalt } } },
            },
        });
    } catch (e) {
        if (isCancellation(e)) throw new BiometricCancelledError();
        throw e;
    }
    if (!credential) throw new BiometricCancelledError();

    const results = credential.getClientExtensionResults();
    if (!results || !results.prf || !results.prf.enabled)
        throw new BiometricUnavailableError(
            'This authenticator does not support PRF'
        );

    const credId = new Uint8Array(credential.rawId);
    // Some authenticators return the secret on creation, others only when
    // authenticating
    const fromCreation = results.prf.results
        ? results.prf.results.first
        : undefined;
    const secret = fromCreation
        ? toSecret(fromCreation)
        : await getPrfSecret(credId, prfSalt);

    let privateKeyJwk;
    try {
        privateKeyJwk = await getPrivateKeyJwk();
    } catch (e) {
        secret.fill(0);
        throw e;
    }

    const enrollment = await wrapPrivateKey({
        secret,
        privateKeyJwk,
        credId: toBase64Url(credId),
        prfSalt: toBase64Url(prfSalt),
        owner,
    });

    localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(enrollment));
    localStorage.removeItem(DECLINED_STORAGE_KEY);
    return enrollment;
};

/**
 * Asks for the biometric verification and returns the plain private key
 * (JWK as a JSON string) of the given user.
 */
export const unlockWithBiometric = async (owner, signal) => {
    const enrollment = getEnrollment(owner);
    if (enrollment === null) throw new BiometricUnavailableError();
    const secret = await getPrfSecret(
        fromBase64Url(enrollment.credId),
        fromBase64Url(enrollment.prfSalt),
        signal
    );
    return unwrapPrivateKey({ secret, enrollment });
};
// #endregion
