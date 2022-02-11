
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

describe('Crypto library tests', () => {

    const DEFAULT_PASSWORD = 'testPassword123A!NcA';

    let cryptoLib;

    beforeAll(()=>{
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
        global.crypto = crypto;
        cryptoLib = require('../crypto.js');
    });

    test('should derive an aes key from a password string', async () => {
        const salt = cryptoLib.generateSalt();
        const aesKey = await cryptoLib.deriveKeyFromPassword(DEFAULT_PASSWORD, salt, ['encrypt']);
        expect(aesKey).toBeDefined();
    });

    test('should be able to encrypt and decrypt data simetrically using a password', async () => {
        const secretData = 'test data';
        const encryptedData = await cryptoLib.encrypt(secretData, DEFAULT_PASSWORD);
        const decryptedData = await cryptoLib.decrypt(encryptedData, DEFAULT_PASSWORD);
        expect(encryptedData).toBeDefined();
        expect(decryptedData).toBe(secretData);
    });

    test('should be able to generate a new RSA key', async ()=>{
        const keyPair = await cryptoLib.createRSAKeyPair();
        expect(keyPair).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.privateKey).toBeDefined();
    });

    test('should be able to generate a new wrapped RSA key-pair', async ()=>{
        const keyPair = await cryptoLib.createExportableRSAKeyPair(DEFAULT_PASSWORD);
        expect(keyPair).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.privateKey).toBeDefined();
    });

    test('should be able to import and decrypt an RSA key-pair', async ()=>{
        const keyPair = await cryptoLib.createExportableRSAKeyPair(DEFAULT_PASSWORD);
        
        const unwrappedKey = await cryptoLib.importRSAKeyPair(keyPair, DEFAULT_PASSWORD);
        expect(unwrappedKey).toBeDefined();
        expect(unwrappedKey.publicKey).toBeDefined();
        expect(unwrappedKey.privateKey).toBeDefined();
    });

    test('should be able to encrypt and decrypt data asimetrically with RSA', async ()=>{
        const dataToEncrypt = 'test data';
        const keyPair = await cryptoLib.createRSAKeyPair();
        const encryptedData = await cryptoLib.RSAEncrypt(dataToEncrypt, keyPair.publicKey);
        const decryptedData = await cryptoLib.RSADecrypt(encryptedData, keyPair.privateKey);
        expect(encryptedData).toBeDefined();
        expect(decryptedData).toBe(dataToEncrypt);
    });

    test('should be able to generate a random AES key, and encrypt/decrypt it using RSA', async ()=>{
        const keyPair = await cryptoLib.createRSAKeyPair();
        const encryptedAESKey = await cryptoLib.generateExportableAESKey(keyPair.publicKey);
        const decryptedAESKey = await cryptoLib.importAESKey(encryptedAESKey, keyPair.privateKey);

        expect(encryptedAESKey).toBeDefined();
        expect(decryptedAESKey).toBeDefined();
        // We can use the decrypted key to encrypt and decrypt data 
        const dataToEncrypt = 'test data';
        const encryptedData = await cryptoLib.encrypt(dataToEncrypt, decryptedAESKey);
        const decryptedData = await cryptoLib.decrypt(encryptedData, decryptedAESKey);
        expect(encryptedData).toBeDefined();
        expect(decryptedData).toBe(dataToEncrypt);
        
    });
});