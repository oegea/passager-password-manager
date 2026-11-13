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
 * Passager cryptography, built on the browser's native WebCrypto API.
 *
 * This module started as a copy of `@useful-tools/crypto@1.1.0` and must stay
 * wire compatible with it: everything that older Passager clients produce has
 * to be readable here, and everything shared with other users (folder keys,
 * passwords) has to stay readable by older clients.
 *
 * WIRE FORMATS
 *
 * - Passwords / usernames (AES-256-GCM with the folder key):
 *       base64( salt[16] | iv[12] | ciphertext+tag )
 *   The salt is unused by AES-GCM, it is only kept for format compatibility.
 *
 * - Folder keys: base64( RSA-OAEP-4096/SHA-256( JSON(JWK of the AES key) ) )
 *
 * - User private key, wrapped with the master password. This is the only
 *   place where the key derivation strength matters, and it is versioned:
 *
 *   v1 (legacy, no marker):  base64( salt[16] | iv[12] | ciphertext+tag )
 *                            PBKDF2-HMAC-SHA256, 250.000 iterations
 *   v2 ("pv2." prefix):      "pv2." + base64( salt[16] | iv[12] | ciphertext+tag )
 *                            PBKDF2-HMAC-SHA256, 600.000 iterations, and the
 *                            version bound to the ciphertext as AES-GCM
 *                            additional data.
 *
 *   The version travels inside the string itself (not in a separate document
 *   field) because backends validate documents against a strict field
 *   whitelist, and because the same string is also stored in localStorage,
 *   backups and the printed access kit. A "." can never appear in base64, so
 *   legacy values can not be mistaken for versioned ones.
 */

const subtle = () => globalThis.crypto.subtle;

const buff_to_base64 = (buff) => {
    const bytes = new Uint8Array(buff);
    let binary = '';
    // In blocks: one call per byte is far too slow for files
    for (let i = 0; i < bytes.length; i += 0x8000)
        binary += String.fromCharCode.apply(
            null,
            bytes.subarray(i, i + 0x8000)
        );
    return btoa(binary);
};

const base64_to_buf = (b64) =>
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const enc = new TextEncoder();
const dec = new TextDecoder();

// #region Constants
const RSA_ALGORITHM_CONFIG = {
    name: 'RSA-OAEP',
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
};

export const LEGACY_ENCRYPTION_VERSION = 1;
export const CURRENT_ENCRYPTION_VERSION = 2;

/**
 * Key derivation profiles used to wrap the user's private key.
 * Never edit an existing profile: add a new version instead.
 */
const KEY_DERIVATION_PROFILES = {
    1: { iterations: 250000, hash: 'SHA-256', prefix: '', bound: false },
    2: { iterations: 600000, hash: 'SHA-256', prefix: 'pv2.', bound: true },
};

const VERSIONED_VALUE = /^pv(\d+)\.([\s\S]*)$/;

export class UnsupportedEncryptionVersionError extends Error {
    constructor(version) {
        super(`Unsupported encryption version: ${version}`);
        this.name = 'UnsupportedEncryptionVersionError';
        this.version = version;
    }
}
// #endregion

// #region Encryption version helpers
/**
 * Returns the encryption version of a password-wrapped value.
 * @param {string} data Wrapped value
 * @returns {number|null} Version, or null if there is no value
 */
export const getEncryptionVersion = (data) => {
    if (typeof data !== 'string' || data.length === 0) return null;
    const match = data.match(VERSIONED_VALUE);
    if (match === null) return LEGACY_ENCRYPTION_VERSION;
    return Number(match[1]);
};

/**
 * Tells whether a password-wrapped value uses an older key derivation
 * than the current one.
 */
export const needsEncryptionUpgrade = (data) => {
    const version = getEncryptionVersion(data);
    return version !== null && version < CURRENT_ENCRYPTION_VERSION;
};

const _getProfile = (version) => {
    const profile = KEY_DERIVATION_PROFILES[version];
    if (profile === undefined)
        throw new UnsupportedEncryptionVersionError(version);
    return profile;
};

const _getAdditionalData = (version) =>
    enc.encode(`passager/password-wrapped/v${version}`);

const _getPayload = (data, version) =>
    version === LEGACY_ENCRYPTION_VERSION
        ? data
        : data.match(VERSIONED_VALUE)[2];
// #endregion

// #region AES key generation
/**
 * Generates a random AES key
 * @returns {Promise<CryptoKey>} The generated key
 */
export const generateAESKey = async () => {
    const key = await subtle().generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
    return key;
};

/**
 * Generates an AES key encrypted with an RSA public key
 */
export const generateExportableAESKey = async (publicKey) => {
    const key = await generateAESKey();
    const exportedKey = await _exportKey(key);
    const stringifiedKey = JSON.stringify(exportedKey);
    const encryptedKey = await RSAEncrypt(stringifiedKey, publicKey);
    return encryptedKey;
};

/**
 * Imports an AES key that has been encrypted with a public RSA key
 */
export const importAESKey = async (encryptedKey, privateKey) => {
    const plainTextKey = await RSADecrypt(encryptedKey, privateKey);
    const key = JSON.parse(plainTextKey);
    const importedKey = await _importKey(
        key,
        {
            name: 'AES-GCM',
            length: 256,
        },
        ['encrypt', 'decrypt']
    );

    return importedKey;
};
// #endregion

// #region Derive an AES key from a password
/**
 * Generates an AES key from a password
 * @returns {Promise<CryptoKey>} AES key
 */
export const deriveKeyFromPassword = async (
    password,
    salt,
    usage,
    version = LEGACY_ENCRYPTION_VERSION
) => {
    const { iterations, hash } = _getProfile(version);
    const passwordKey = await subtle().importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return subtle().deriveKey(
        { name: 'PBKDF2', salt, iterations, hash },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        usage
    );
};
// #endregion

// #region Salt and IV generation
export const generateSalt = () =>
    globalThis.crypto.getRandomValues(new Uint8Array(16));

export const generateIv = () =>
    globalThis.crypto.getRandomValues(new Uint8Array(12));
// #endregion

// #region AES encryption using a password
/**
 * Encrypts data with a key derived from a password.
 * @param {string} data Text to encrypt
 * @param {string} password Password
 * @param {number} version Encryption version (defaults to the current one)
 * @returns {Promise<string>} Wrapped value
 */
export const encrypt = async (
    data,
    password,
    version = CURRENT_ENCRYPTION_VERSION
) => {
    const profile = _getProfile(version);
    const salt = generateSalt();
    const iv = generateIv();
    const aesKey = await deriveKeyFromPassword(
        password,
        salt,
        ['encrypt'],
        version
    );
    const additionalData = profile.bound
        ? _getAdditionalData(version)
        : undefined;

    const encryptedData = await encryptData(
        data,
        salt,
        iv,
        aesKey,
        additionalData
    );
    if (!encryptedData) {
        throw new Error('Encryption failed');
    }
    return profile.prefix + encryptedData;
};

/**
 * Decrypts data that was encrypted with `encrypt`, whatever its version is.
 */
export const decrypt = async (data, password) => {
    const version = getEncryptionVersion(data);
    const profile = _getProfile(version);
    const encryptedDataBuff = base64_to_buf(_getPayload(data, version));
    const salt = encryptedDataBuff.slice(0, 16);
    const iv = encryptedDataBuff.slice(16, 16 + 12);
    const filteredData = encryptedDataBuff.slice(16 + 12);
    const aesKey = await deriveKeyFromPassword(
        password,
        salt,
        ['decrypt'],
        version
    );
    const additionalData = profile.bound
        ? _getAdditionalData(version)
        : undefined;
    const decryptedData = await decryptData(
        filteredData,
        salt,
        iv,
        aesKey,
        additionalData
    );
    if (!decryptedData) {
        throw new Error('Decryption failed');
    }
    return decryptedData;
};

export const AESEncrypt = async (data, aesKey) => {
    const salt = generateSalt();
    const iv = generateIv();

    const encryptedData = await encryptData(data, salt, iv, aesKey);
    return encryptedData;
};

export const AESDecrypt = async (data, aesKey) => {
    const encryptedDataBuff = base64_to_buf(data);
    const salt = encryptedDataBuff.slice(0, 16);
    const iv = encryptedDataBuff.slice(16, 16 + 12);
    const filteredData = encryptedDataBuff.slice(16 + 12);
    const decryptedData = await decryptData(filteredData, salt, iv, aesKey);
    if (!decryptedData) {
        throw new Error('Decryption failed');
    }
    return decryptedData;
};

/**
 * Encrypts raw bytes with an AES key (used for the pieces of a file).
 * @returns {Promise<string>} base64( iv[12] | ciphertext+tag )
 */
export const AESEncryptBytes = async (bytes, aesKey) => {
    const iv = generateIv();
    const encrypted = new Uint8Array(
        await subtle().encrypt({ name: 'AES-GCM', iv }, aesKey, bytes)
    );
    const buff = new Uint8Array(iv.byteLength + encrypted.byteLength);
    buff.set(iv, 0);
    buff.set(encrypted, iv.byteLength);
    return buff_to_base64(buff);
};

/**
 * Decrypts what `AESEncryptBytes` produced. Throws if it has been altered.
 * @returns {Promise<Uint8Array>}
 */
export const AESDecryptBytes = async (data, aesKey) => {
    const buff = base64_to_buf(data);
    const decrypted = await subtle().decrypt(
        { name: 'AES-GCM', iv: buff.slice(0, 12) },
        aesKey,
        buff.slice(12)
    );
    return new Uint8Array(decrypted);
};

const _getAesGcmParams = (iv, additionalData) =>
    additionalData === undefined
        ? { name: 'AES-GCM', iv }
        : { name: 'AES-GCM', iv, additionalData };

/**
 * Simmetrically encrypts data using an AES key, salt, and iv
 */
async function encryptData(secretData, salt, iv, aesKey, additionalData) {
    try {
        const encryptedContent = await subtle().encrypt(
            _getAesGcmParams(iv, additionalData),
            aesKey,
            enc.encode(secretData)
        );

        const encryptedContentArr = new Uint8Array(encryptedContent);
        let buff = new Uint8Array(
            salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
        );
        buff.set(salt, 0);
        buff.set(iv, salt.byteLength);
        buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
        const base64Buff = buff_to_base64(buff);
        return base64Buff;
    } catch (e) {
        console.log(`Error - ${e}`);
        return '';
    }
}

/**
 * Simmetrically decrypts data using an AES key and iv
 */
export async function decryptData(data, salt, iv, aesKey, additionalData) {
    try {
        const decryptedContent = await subtle().decrypt(
            _getAesGcmParams(iv, additionalData),
            aesKey,
            data
        );
        return dec.decode(decryptedContent);
    } catch (e) {
        console.log(`Error - ${e}`);
        return '';
    }
}
// #endregion

// #region Export and import keys
const _exportKey = (key) => subtle().exportKey('jwk', key);

const _importKey = (key, algorithm, usages) =>
    subtle().importKey('jwk', key, algorithm, false, usages);
// #endregion

// #region RSA key pair generation
/**
 * Generates a secure RSA key pair
 */
export const createRSAKeyPair = async () => {
    const keyPair = await subtle().generateKey(RSA_ALGORITHM_CONFIG, true, [
        'encrypt',
        'decrypt',
    ]);

    return keyPair;
};

/**
 * Generates an RSA key pair in an exportable format, and with the private key
 * simmetrically encrypted
 * @param {String} password Password with which wrap the private key
 * @returns Exportable key pair
 */
export const createExportableRSAKeyPair = async (password) => {
    const keyPair = await createRSAKeyPair();
    const exportedPublicKey = await _exportKey(keyPair.publicKey);
    const exportedPrivateKey = await _exportKey(keyPair.privateKey);

    const encryptedPrivateKey = await encrypt(
        JSON.stringify(exportedPrivateKey),
        password
    );

    return {
        privateKey: encryptedPrivateKey,
        publicKey: JSON.stringify(exportedPublicKey),
    };
};

/**
 * Imports a private key from its plain JWK (as a JSON string).
 * The resulting key can not be extracted again.
 */
export const importRSAPrivateKey = async (privateKeyJwk) => {
    return _importKey(JSON.parse(privateKeyJwk), RSA_ALGORITHM_CONFIG, [
        'decrypt',
    ]);
};

export const importRSAPublicKey = async (publicKey) => {
    const result = await _importKey(
        JSON.parse(publicKey),
        RSA_ALGORITHM_CONFIG,
        ['encrypt']
    );
    return result;
};

/**
 * Unwraps the user's private key with the master password.
 * @returns {Promise<string>} Plain private key (JWK as a JSON string)
 */
export const decryptPrivateKey = (encryptedPrivateKey, password) =>
    decrypt(encryptedPrivateKey, password);

export const importRSAKeyPair = async (keyPair, password) => {
    const decryptedPrivateKey = await decryptPrivateKey(
        keyPair.privateKey,
        password
    );
    const privateKey = await importRSAPrivateKey(decryptedPrivateKey);
    const publicKey = await importRSAPublicKey(keyPair.publicKey);

    return { privateKey: privateKey, publicKey: publicKey };
};

/**
 * Wraps again an already wrapped private key using the current encryption
 * version. The result is verified before being returned: it is decrypted
 * again and compared with the original key, so a value that could not be
 * opened later is never handed back.
 *
 * @param {string} encryptedPrivateKey Private key wrapped with any version
 * @param {string} password Master password
 * @returns {Promise<string>} Private key wrapped with the current version
 */
export const upgradePrivateKeyEncryption = async (
    encryptedPrivateKey,
    password
) => {
    const privateKeyJwk = await decryptPrivateKey(
        encryptedPrivateKey,
        password
    );
    // It must be a usable RSA private key, not just any text
    await importRSAPrivateKey(privateKeyJwk);

    const upgradedPrivateKey = await encrypt(
        privateKeyJwk,
        password,
        CURRENT_ENCRYPTION_VERSION
    );

    const verification = await decryptPrivateKey(upgradedPrivateKey, password);
    if (verification !== privateKeyJwk) {
        throw new Error('Private key upgrade verification failed');
    }

    return upgradedPrivateKey;
};
// #endregion

// #region RSA encrypt and decrypt
export const RSAEncrypt = async (data, publicKey) => {
    const encryptedData = await subtle().encrypt(
        RSA_ALGORITHM_CONFIG,
        publicKey,
        enc.encode(data)
    );

    return buff_to_base64(encryptedData);
};

export const RSADecrypt = async (data, privateKey) => {
    const decryptedData = await subtle().decrypt(
        RSA_ALGORITHM_CONFIG,
        privateKey,
        base64_to_buf(data)
    );

    return dec.decode(decryptedData);
};
// #endregion
