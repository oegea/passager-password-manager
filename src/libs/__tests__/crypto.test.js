
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

    test('should be able to import and decrypt a key-pair', async ()=>{
        const keyPair = await cryptoLib.createExportableRSAKeyPair(DEFAULT_PASSWORD);
        
        const unwrappedKey = await cryptoLib.importRSAKeyPair(keyPair, DEFAULT_PASSWORD);
        expect(unwrappedKey).toBeDefined();
        expect(unwrappedKey.publicKey).toBeDefined();
        expect(unwrappedKey.privateKey).toBeDefined();

    });
});