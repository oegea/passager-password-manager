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
    createEmptyItem,
    formatBytes,
    fromStoredFields,
    getItemType,
    ITEM_FIELDS,
    ITEM_TYPE_CARD,
    ITEM_TYPE_FILE,
    ITEM_TYPE_KEY_PAIR,
    ITEM_TYPE_NOTE,
    ITEM_TYPE_PASSWORD,
    ITEM_TYPES,
    ItemTooLargeError,
    MAX_CONTENT_BYTES,
    MAX_FILE_BYTES,
    readFile,
    toStoredFields,
} from './items.js';

// The only fields every backend version accepts for a password document
const STORED_FIELDS = ['name', 'password', 'url', 'username'];

const SAMPLES = {
    [ITEM_TYPE_CARD]: {
        cardholder: 'ORIOL EGEA',
        number: '4111 1111 1111 1111',
        expiry: '12/29',
        cvv: '123',
        pin: '',
        notes: 'Línea 1\nLínea 2 €',
    },
    [ITEM_TYPE_KEY_PAIR]: {
        publicKey: 'ssh-ed25519 AAAA deploy@server',
        privateKey: '-----BEGIN KEY-----\nabc\n-----END KEY-----',
        passphrase: '',
    },
    [ITEM_TYPE_FILE]: {
        file: { name: 'codes.txt', mime: 'text/plain', size: 4, data: 'YWJjZA==' },
    },
    [ITEM_TYPE_NOTE]: { text: 'sk_live_token\nsecond line "quoted" {json}' },
};

describe('passwords keep their original layout', () => {
    test('are stored exactly as before', () => {
        const stored = toStoredFields({
            type: ITEM_TYPE_PASSWORD,
            name: 'GitHub',
            values: { url: 'https://github.com', username: 'me', password: 's3cret' },
        });
        expect(stored).toEqual({
            name: 'GitHub',
            url: 'https://github.com',
            username: 'me',
            password: 's3cret',
        });
    });

    test('are read exactly as before, whatever they contain', () => {
        for (const password of ['s3cret', '{"type":"card"}', 'passager://card', '']) {
            const item = fromStoredFields({
                name: 'x',
                url: 'https://example.com',
                username: 'me',
                password,
            });
            expect(item.type).toBe(ITEM_TYPE_PASSWORD);
            expect(item.values).toEqual({
                url: 'https://example.com',
                username: 'me',
                password,
            });
        }
    });
});

describe.each(Object.keys(SAMPLES))('%s items', (type) => {
    const item = { type, name: 'My item', values: SAMPLES[type] };

    test('only use the fields every backend accepts', () => {
        const stored = toStoredFields(item);
        expect(Object.keys(stored).sort()).toEqual(STORED_FIELDS);
        for (const field of STORED_FIELDS) {
            expect(typeof stored[field]).toBe('string');
            // An empty value can not be encrypted and read back
            expect(stored[field].length).toBeGreaterThan(0);
        }
        expect(stored.name).toBe('My item');
    });

    test('survive being stored and read', () => {
        const stored = toStoredFields(item);
        expect(getItemType(stored.url)).toBe(type);
        expect(fromStoredFields(stored)).toEqual(item);
    });

    test('never expose secrets outside the encrypted content', () => {
        const stored = toStoredFields(item);
        // `name` and `url` are not encrypted
        const notEncrypted = `${stored.name} ${stored.url}`;
        for (const value of Object.values(SAMPLES[type])) {
            if (typeof value === 'string' && value.length > 0)
                expect(notEncrypted).not.toContain(value);
        }
    });

    test('older versions see a regular password, with nothing lost', () => {
        // Old clients ignore the marker and show the four fields as they are
        const stored = toStoredFields(item);
        const content = JSON.parse(stored.password);
        expect(content.type).toBe(type);
        for (const [key, value] of Object.entries(SAMPLES[type])) {
            if (value !== '') expect(content[key]).toEqual(value);
        }
    });
});

describe('summaries', () => {
    test('a card only shows its last digits', () => {
        const stored = toStoredFields({
            type: ITEM_TYPE_CARD,
            name: 'Card',
            values: SAMPLES[ITEM_TYPE_CARD],
        });
        expect(stored.username).toBe('•••• 1111');
    });

    test('a file shows its name', () => {
        const stored = toStoredFields({
            type: ITEM_TYPE_FILE,
            name: 'File',
            values: SAMPLES[ITEM_TYPE_FILE],
        });
        expect(stored.username).toBe('codes.txt');
    });
});

describe('type detection', () => {
    test('anything without a known marker is a password', () => {
        for (const url of [undefined, null, '', 'https://x.com', 'passager://', 'passager://unknown', 'passager://password', 'PASSAGER://card'])
            expect(getItemType(url)).toBe(ITEM_TYPE_PASSWORD);
        expect(getItemType('passager://card')).toBe(ITEM_TYPE_CARD);
        expect(getItemType('passager://keypair')).toBe(ITEM_TYPE_KEY_PAIR);
        expect(getItemType('passager://file')).toBe(ITEM_TYPE_FILE);
        expect(getItemType('passager://note')).toBe(ITEM_TYPE_NOTE);
    });

    test('content that can not be understood is shown as it is', () => {
        const cases = [
            'not json',
            '"a string"',
            'null',
            '{"type":"note","text":"x"}', // marker says card
            '{"v":1}',
        ];
        for (const password of cases) {
            const item = fromStoredFields({
                name: 'x',
                url: 'passager://card',
                username: 'card',
                password,
            });
            expect(item.type).toBe(ITEM_TYPE_PASSWORD);
            expect(item.values.password).toBe(password);
        }
        // A file without its data is not a file
        const broken = fromStoredFields({
            name: 'x',
            url: 'passager://file',
            username: 'f',
            password: '{"v":1,"type":"file","file":{"name":"a"}}',
        });
        expect(broken.type).toBe(ITEM_TYPE_PASSWORD);
    });

    test('content written by a newer version keeps what is known', () => {
        const item = fromStoredFields({
            name: 'x',
            url: 'passager://note',
            username: 'note',
            password: '{"v":2,"type":"note","text":"hello","future":true}',
        });
        expect(item).toEqual({
            type: ITEM_TYPE_NOTE,
            name: 'x',
            values: { text: 'hello' },
        });
    });
});

describe('size limits', () => {
    test('stay below what every backend accepts in one request', () => {
        // 100 KB per request; encrypting adds a third
        const worstCase = Math.ceil(((MAX_CONTENT_BYTES + 44) * 4) / 3) + 2048;
        expect(worstCase).toBeLessThan(100 * 1024);
        // A file of the maximum size fits once encoded
        expect(Math.ceil((MAX_FILE_BYTES * 4) / 3) + 512).toBeLessThan(
            MAX_CONTENT_BYTES
        );
    });

    test('rejects content that is too large instead of sending it', () => {
        const tooLong = 'x'.repeat(MAX_CONTENT_BYTES);
        expect(() =>
            toStoredFields({
                type: ITEM_TYPE_NOTE,
                name: 'Note',
                values: { text: tooLong },
            })
        ).toThrow(ItemTooLargeError);
        // Multi-byte characters count as what they weigh
        expect(() =>
            toStoredFields({
                type: ITEM_TYPE_NOTE,
                name: 'Note',
                values: { text: '€'.repeat(MAX_CONTENT_BYTES / 2) },
            })
        ).toThrow(ItemTooLargeError);
        expect(() =>
            toStoredFields({
                type: ITEM_TYPE_NOTE,
                name: 'Note',
                values: { text: 'x'.repeat(MAX_CONTENT_BYTES - 200) },
            })
        ).not.toThrow();
    });

    test('reads a file of the maximum size and stores it', async () => {
        const bytes = new Uint8Array(MAX_FILE_BYTES).map((_, i) => i % 256);
        const file = await readFile(
            new File([bytes], 'key.bin', { type: 'application/octet-stream' })
        );
        expect(file.size).toBe(MAX_FILE_BYTES);
        const stored = toStoredFields({
            type: ITEM_TYPE_FILE,
            name: 'Key',
            values: { file },
        });
        const back = fromStoredFields(stored).values.file;
        expect(Uint8Array.from(atob(back.data), (c) => c.charCodeAt(0))).toEqual(
            bytes
        );
    });

    test('rejects a file that is too large', async () => {
        const file = new File([new Uint8Array(MAX_FILE_BYTES + 1)], 'big.bin');
        await expect(readFile(file)).rejects.toBeInstanceOf(ItemTooLargeError);
    });
});

describe('helpers', () => {
    test('every type has fields and an empty item', () => {
        for (const type of ITEM_TYPES) {
            expect(ITEM_FIELDS[type].length).toBeGreaterThan(0);
            const empty = createEmptyItem(type);
            expect(empty.type).toBe(type);
            expect(Object.keys(empty.values)).toEqual(
                ITEM_FIELDS[type].map((field) => field.id)
            );
        }
    });

    test('formats sizes', () => {
        expect(formatBytes(20)).toBe('20 B');
        expect(formatBytes(1536)).toBe('1.5 KB');
        expect(formatBytes(48 * 1024)).toBe('48 KB');
    });
});
