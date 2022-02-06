const buff_to_base64 = (buff) => btoa(new Uint8Array(buff).reduce(function (data, byte) {
    return data + String.fromCharCode(byte);
}, ''));

const base64_to_buf = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));

const enc = new TextEncoder();
const dec = new TextDecoder();

export const encrypt = async (data, password) => {
  const encryptedData = await encryptData(data, password);
  return encryptedData;
}

export const decrypt = async (data, password) => {
    const decryptedData = await decryptData(data, password);
    if (!decryptedData) {
        throw new Error("Decryption failed");
    }
    return decryptedData;
}

const getPasswordKey = (password) =>
  window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

const deriveKey = (passwordKey, salt, keyUsage) =>
  window.crypto.subtle.deriveKey(
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

const generateSalt = () => window.crypto.getRandomValues(new Uint8Array(16));
const generateIv = () => window.crypto.getRandomValues(new Uint8Array(12));

async function encryptData(secretData, password) {
  try {
    const salt = generateSalt();
    const iv = generateIv();
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
    const encryptedContent = await window.crypto.subtle.encrypt(
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

async function decryptData(encryptedData, password) {
  try {
    const encryptedDataBuff = base64_to_buf(encryptedData);
    const salt = encryptedDataBuff.slice(0, 16);
    const iv = encryptedDataBuff.slice(16, 16 + 12);
    const data = encryptedDataBuff.slice(16 + 12);
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
    const decryptedContent = await window.crypto.subtle.decrypt(
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

export const createRSAKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
        name: "RSA-OAEP",
        // Consider using a 4096-bit key for systems that require long-term security
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    )

    return keyPair;
}

export const createExportableRSAKeyPair = async (password) => {
    const keyPair = await createRSAKeyPair();
    const exportedPublicKey = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey
    );

    const salt = generateSalt();
    const iv = generateIv();
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["wrapKey"]);

    let wrappedPrivateKey = await window.crypto.subtle.wrapKey(
        "jwk",
        keyPair.privateKey,
        aesKey,
        {
            name: "AES-GCM",
            iv: iv,
        }
    );
    wrappedPrivateKey = new Uint8Array(wrappedPrivateKey);
    return {privateKey: JSON.stringify(wrappedPrivateKey), publicKey: JSON.stringify(exportedPublicKey)};
}