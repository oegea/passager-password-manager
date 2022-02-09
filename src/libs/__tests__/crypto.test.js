
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

describe('Crypto library tests', () => {

    let cryptoLib;

    beforeAll(()=>{
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
        global.crypto = crypto;
        cryptoLib = require('../crypto.js');
    });

    test('should derive an aes key from a password string', async () => {
        const password = 'password';
        const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        const aesKey = await cryptoLib.deriveKeyFromPassword(password, salt, ['encrypt']);
        expect(aesKey).toBeDefined();
    });
});