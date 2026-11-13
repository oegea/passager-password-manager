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
 * Item types: besides passwords, a folder can hold payment cards, key pairs,
 * small files and secure notes.
 *
 * NO BACKEND CHANGES ARE NEEDED. Every backend version validates password
 * documents against a strict list of fields (name, url, username, password),
 * so the new types travel inside those same fields:
 *
 * - `name`:     the title, as always (not encrypted, as always).
 * - `url`:      a marker with the type, e.g. `passager://card`. It is what
 *               the list uses to show an icon without decrypting anything.
 * - `username`: a short encrypted summary (never empty).
 * - `password`: the encrypted content, as JSON: `{ "v": 1, "type": "card", ...}`.
 *
 * Small files travel inside the item as well. Larger ones are stored apart,
 * in pieces, by backends that support it (see `src/libs/fileStorage.js`),
 * and the item only keeps a reference: `{ name, mime, size, remote }`.
 *
 * Passwords keep their original layout, untouched.
 *
 * Older versions of Passager show these items as a regular password whose
 * website is the marker and whose password is the JSON text: odd, but
 * nothing breaks and nothing is lost.
 */

export const ITEM_TYPE_PASSWORD = 'password';
export const ITEM_TYPE_CARD = 'card';
export const ITEM_TYPE_KEY_PAIR = 'keypair';
export const ITEM_TYPE_FILE = 'file';
export const ITEM_TYPE_NOTE = 'note';

export const ITEM_TYPES = [
    ITEM_TYPE_PASSWORD,
    ITEM_TYPE_CARD,
    ITEM_TYPE_KEY_PAIR,
    ITEM_TYPE_FILE,
    ITEM_TYPE_NOTE,
];

const MARKER_PREFIX = 'passager://';
const PAYLOAD_VERSION = 1;

/**
 * Backends reject requests bigger than 100 KB, and the content grows by a
 * third when it is encrypted. These limits keep every request well below.
 */
export const MAX_CONTENT_BYTES = 70 * 1024;
export const MAX_FILE_BYTES = 48 * 1024;


/** Room the content needs to hold a file of a size inside the item. */
export const getContentBytesForFile = (fileBytes) =>
    Math.ceil((fileBytes * 4) / 3) + 2048;

/** Fields of each type, apart from the name. */
export const ITEM_FIELDS = {
    [ITEM_TYPE_PASSWORD]: [
        { id: 'url', required: true },
        { id: 'username', required: true, copy: true },
        { id: 'password', required: true, generate: true },
    ],
    [ITEM_TYPE_CARD]: [
        { id: 'cardholder', required: true, copy: true },
        { id: 'number', required: true, copy: true, monospace: true },
        { id: 'expiry', required: true, copy: true },
        { id: 'cvv', required: false, copy: true, monospace: true },
        { id: 'pin', required: false, copy: true, monospace: true },
        { id: 'notes', required: false, multiline: true },
    ],
    [ITEM_TYPE_KEY_PAIR]: [
        { id: 'publicKey', required: false, multiline: true, copy: true, monospace: true },
        { id: 'privateKey', required: true, multiline: true, copy: true, monospace: true },
        { id: 'passphrase', required: false, copy: true },
    ],
    [ITEM_TYPE_FILE]: [{ id: 'file', required: true, file: true }],
    [ITEM_TYPE_NOTE]: [
        { id: 'text', required: true, multiline: true, copy: true, tall: true },
    ],
};

export class ItemTooLargeError extends Error {
    constructor() {
        super('Item is too large');
        this.name = 'ItemTooLargeError';
    }
}

const byteLength = (text) => new TextEncoder().encode(text).length;

/** Type of a stored document, from its (not encrypted) marker. */
export const getItemType = (url) => {
    if (typeof url !== 'string' || !url.startsWith(MARKER_PREFIX))
        return ITEM_TYPE_PASSWORD;
    const type = url.slice(MARKER_PREFIX.length);
    return ITEM_TYPES.includes(type) && type !== ITEM_TYPE_PASSWORD
        ? type
        : ITEM_TYPE_PASSWORD;
};

const getMarker = (type) => `${MARKER_PREFIX}${type}`;

/** Last four digits of a card number, for the summary. */
const maskCardNumber = (number) => {
    const digits = `${number}`.replace(/\D/g, '');
    return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : '••••';
};

const getSummary = (type, values) => {
    switch (type) {
    case ITEM_TYPE_CARD:
        return maskCardNumber(values.number);
    case ITEM_TYPE_FILE:
        return values.file.name;
    default:
        return type;
    }
};

/**
 * Converts what the form holds into the four fields that are stored.
 * `username` and `password` are plain here: they are encrypted afterwards.
 *
 * @param {object} item `{ type, name, values }`
 * @returns {object} `{ name, url, username, password }`
 */
export const toStoredFields = (
    { type, name, values },
    { maxContentBytes = MAX_CONTENT_BYTES } = {}
) => {
    if (type === ITEM_TYPE_PASSWORD) {
        return {
            name,
            url: values.url,
            username: values.username,
            password: values.password,
        };
    }

    const content = { v: PAYLOAD_VERSION, type };
    for (const field of ITEM_FIELDS[type]) {
        const value = values[field.id];
        if (value !== undefined && value !== '' && value !== null)
            content[field.id] = value;
    }
    const password = JSON.stringify(content);

    if (byteLength(password) > maxContentBytes) throw new ItemTooLargeError();

    return {
        name,
        url: getMarker(type),
        username: getSummary(type, values) || type,
        password,
    };
};

const emptyValues = (type) =>
    Object.fromEntries(
        ITEM_FIELDS[type].map((field) => [field.id, field.file ? null : ''])
    );

/**
 * Converts a decrypted stored document into what the form holds.
 * Anything that can not be understood is shown as a regular password, so no
 * content is ever hidden.
 *
 * @param {object} document `{ name, url, username, password }`, decrypted
 * @returns {object} `{ type, name, values }`
 */
export const fromStoredFields = ({
    name = '',
    url = '',
    username = '',
    password = '',
} = {}) => {
    const asPassword = {
        type: ITEM_TYPE_PASSWORD,
        name,
        values: { url, username, password },
    };

    const type = getItemType(url);
    if (type === ITEM_TYPE_PASSWORD) return asPassword;

    try {
        const content = JSON.parse(password);
        if (!content || typeof content !== 'object' || content.type !== type)
            return asPassword;

        const values = emptyValues(type);
        for (const field of ITEM_FIELDS[type]) {
            if (content[field.id] === undefined) continue;
            if (field.file) {
                const file = content[field.id];
                const isInline = file && typeof file.data === 'string';
                const isRemote =
                    file &&
                    file.remote &&
                    typeof file.remote.id === 'string' &&
                    Number.isInteger(file.remote.chunks);
                if (
                    !file ||
                    typeof file.name !== 'string' ||
                    (!isInline && !isRemote)
                )
                    return asPassword;
                values[field.id] = {
                    name: file.name,
                    mime: typeof file.mime === 'string' ? file.mime : '',
                    size: Number(file.size) || 0,
                    ...(isInline
                        ? { data: file.data }
                        : {
                            remote: {
                                id: file.remote.id,
                                chunks: file.remote.chunks,
                            },
                        }),
                };
            } else {
                values[field.id] = `${content[field.id]}`;
            }
        }
        return { type, name, values };
    } catch (e) {
        return asPassword;
    }
};

/** Empty item of a type, to start the form. */
export const createEmptyItem = (type = ITEM_TYPE_PASSWORD) => ({
    type,
    name: '',
    values: emptyValues(type),
});

// #region Files
export const bytesToBase64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
};

export const base64ToBytes = (base64) =>
    Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

/**
 * Reads a file chosen by the user.
 * @param {File} file
 * @returns {Promise<object>} `{ name, mime, size, data }` (data in base64)
 */
export const readFile = async (file, maxBytes = MAX_FILE_BYTES) => {
    if (file.size > maxBytes) throw new ItemTooLargeError();
    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: bytes.length,
        data: bytesToBase64(bytes),
    };
};

/** Saves a stored file to the device. */
export const downloadFile = ({ name, mime, data }) => {
    const blob = new Blob([base64ToBytes(data)], {
        // Never let the browser open stored content as a page
        type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    link.dataset.mime = mime || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(megabytes < 10 && megabytes % 1 ? 1 : 0)} MB`;
};
// #endregion
