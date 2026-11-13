/** 
 * This file is part of Useful set of javascript tools.
 * https://github.com/oegea/useful
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

const buff_to_base64 = (buff) => btoa(new Uint8Array(buff).reduce(function (data, byte) {
    return data + String.fromCharCode(byte);
}, ''));

const base64_to_buf = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));

export const utils = {TextEncoder, TextDecoder};
const enc = new utils.TextEncoder();
const dec = new utils.TextDecoder();

// #region Constants
const RSA_ALGORITHM_CONFIG = {
  name: "RSA-OAEP",
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};
// #endregion

// #region AES key generation
/**
 * Generates a random AES key
 * @returns {Promise<CryptoKey>} The generated key
 */
export const generateAESKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

/**
 * Generates an AES key encrypted with an RSA public key
 * @returns 
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
 * @returns 
 */
export const importAESKey = async (encryptedKey, privateKey) => {
  const plainTextKey = await RSADecrypt(encryptedKey, privateKey);
  const key = JSON.parse(plainTextKey);
  const importedKey = await _importKey(key, {
    name: "AES-GCM",
    length: 256,
  }, ["encrypt", "decrypt"]);

  return importedKey;
};
// #endregion

// #region Derive an AES key from a password

/**
 * Generates an AES key from a password
 * @returns {Promise<CryptoKey>} AES key
 */
export const deriveKeyFromPassword = async (password, salt, usage) => {
  const passwordKey = await _getPasswordKey(password);
  const aesKey = await _deriveKey(passwordKey, salt, usage);
  return aesKey;
}

const _getPasswordKey = (password) =>
  crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

const _deriveKey = (passwordKey, salt, keyUsage) =>
  crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 250000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsage
  );
// #endregion

// #region Salt and IV generation
/**
 * Generates a salt
 * @returns {Promise<Uint8Array>} salt
 */
export const generateSalt = () => crypto.getRandomValues(new Uint8Array(16));

/**
 * Generates an iv
 * @returns {Promise<Uint8Array>} iv
 */
export const generateIv = () => crypto.getRandomValues(new Uint8Array(12));
// #endregion

// #region AES encryption using a password

export const encrypt = async (data, password) => {
  const salt = generateSalt();
  const iv = generateIv();
  const aesKey = await deriveKeyFromPassword(password, salt, ["encrypt"]);

  const encryptedData = await encryptData(data, salt, iv, aesKey);
  return encryptedData;
}

export const decrypt = async (data, password) => {
    const encryptedDataBuff = base64_to_buf(data);
    const salt = encryptedDataBuff.slice(0, 16);
    const iv = encryptedDataBuff.slice(16, 16 + 12);
    const filteredData = encryptedDataBuff.slice(16 + 12);
    const aesKey = await deriveKeyFromPassword(password, salt, ["decrypt"]);
    const decryptedData = await decryptData(filteredData, salt, iv, aesKey);
    if (!decryptedData) {
        throw new Error("Decryption failed");
    }
    return decryptedData;
}

export const AESEncrypt = async(data, aesKey) => {
  const salt = generateSalt();
  const iv = generateIv();

  const encryptedData = await encryptData(data, salt, iv, aesKey);
  return encryptedData;
}

export const AESDecrypt = async(data, aesKey) => {
  const encryptedDataBuff = base64_to_buf(data);
  const salt = encryptedDataBuff.slice(0, 16);
  const iv = encryptedDataBuff.slice(16, 16 + 12);
  const filteredData = encryptedDataBuff.slice(16 + 12);
  const decryptedData = await decryptData(filteredData, salt, iv, aesKey);
  if (!decryptedData) {
      throw new Error("Decryption failed");
  }
  return decryptedData;
}

/**
 * Simmetrically encrypts data using an AES key, salt, and iv
 */
async function encryptData(secretData, salt, iv, aesKey) {
  try {
    
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
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
    return "";
  }
}

/**
 * Simmetrically decrypts data using a password from which an AES key is derived
 */
export async function decryptData(data, salt, iv, aesKey) {
  try {

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      data
    );
    return dec.decode(decryptedContent);
  } catch (e) {
    console.log(`Error - ${e}`);
    return "";
  }
}
// #endregion

// #region Export and wrap keys

/**
 * Exports a key in a legible format
 */
const _exportKey = (key) =>
  crypto.subtle.exportKey("jwk", key);

const _importKey = (key, algorithm, usages) =>
  crypto.subtle.importKey("jwk", key, algorithm, false, usages);

// #endregion

// #region RSA key pair generation

/**
 * Generates a secure RSA key pair
 */
export const createRSAKeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey(
        RSA_ALGORITHM_CONFIG,
        true,
        ["encrypt", "decrypt"]
    )

    return keyPair;
}

/**
 * Generates an RSA key pair in an exportable format, and with the private key simmetrically encrypted
 * @param {String} password Password with which wrap the private key
 * @returns Exportable key pair
 */
export const createExportableRSAKeyPair = async (password) => {
    const keyPair = await createRSAKeyPair();
    const exportedPublicKey = await _exportKey(keyPair.publicKey);
    const exportedPrivateKey = await _exportKey(keyPair.privateKey);

    const encryptedPrivateKey = await encrypt(JSON.stringify(exportedPrivateKey), password);

    return {privateKey: encryptedPrivateKey, publicKey: JSON.stringify(exportedPublicKey)};
}

export const importRSAKeyPair = async (keyPair, password) => {
    const decryptedPrivateKey = await decrypt(keyPair.privateKey, password);
    const decryptedPrivateKeyJson = JSON.parse(decryptedPrivateKey);

    const privateKey = await _importKey(decryptedPrivateKeyJson, RSA_ALGORITHM_CONFIG, ["decrypt"]);

    const publicKey = await _importKey(JSON.parse(keyPair.publicKey), RSA_ALGORITHM_CONFIG, ["encrypt"]);

    return {privateKey: privateKey, publicKey: publicKey};
}

export const importRSAPublicKey = async (publicKey) => {
    const result =  await _importKey(JSON.parse(publicKey), RSA_ALGORITHM_CONFIG, ["encrypt"]);
    return result;
}
// #endregion

// #region RSA encrypt and decrypt

export const RSAEncrypt = async (data, publicKey) => {
    const encryptedData = await crypto.subtle.encrypt(
        RSA_ALGORITHM_CONFIG,
        publicKey,
        enc.encode(data)
    );

    return buff_to_base64(encryptedData);
}

export const RSADecrypt = async (data, privateKey) => {
    const decryptedData = await crypto.subtle.decrypt(
        RSA_ALGORITHM_CONFIG,
        privateKey,
        base64_to_buf(data)
    );

    return dec.decode(decryptedData);
}


// #endregion