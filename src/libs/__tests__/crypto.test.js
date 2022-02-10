
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

describe('Crypto library tests', () => {

    const DEFAULT_PASSWORD = 'testPassword';

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

    test('should be able to encrypt and decrypt data simetrically using an AES key', async () => {
        const salt = cryptoLib.generateSalt();
        const aesKey = await cryptoLib.deriveKeyFromPassword(DEFAULT_PASSWORD, salt, ['encrypt', 'decrypt']);

        const secretData = 'test data';
        const encryptedData = await cryptoLib.encryptData(secretData, aesKey);
        const decryptedData = await cryptoLib.decryptData(encryptedData, aesKey);
        expect(encryptedData).toBeDefined();
        expect(decryptedData).toBe(secretData);
    });

    test('should be able to encrypt and decrypt data by using a password, derivating an AES key automatically', async () => {
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

    test('should e able to generate a new exportable and wrapped key pair', async ()=>{
        const keyPair = await cryptoLib.createExportableRSAKeyPair(DEFAULT_PASSWORD);
        expect(keyPair).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.privateKey).toBeDefined();
    });
});