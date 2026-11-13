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
 * Storage of files that do not fit inside an item.
 *
 * Backends accept 100 KB per request, so a file is split into pieces. Every
 * piece is encrypted in this device with the key of the folder (the same
 * one that protects its passwords) and uploaded on its own. Whoever can
 * open the folder can open the file, and nobody else can, the server
 * included.
 *
 * Only backends that announce it in `/capabilities` can do this. With an
 * older backend, or in local mode, files travel inside the item and are
 * limited to what fits there.
 */

import {
    createDocument,
    deleteDocument,
    findDocument,
    getBackendCapabilities,
    isBackendMode,
} from './backend.js';
import {
    AESDecryptBytes,
    AESEncryptBytes,
    importAESKey,
} from './crypto/index.js';
import { base64ToBytes, bytesToBase64, MAX_FILE_BYTES } from './items.js';

const FILES_COLLECTION = 'files';
const FILE_CHUNKS_COLLECTION = 'fileChunks';
const PARALLEL_REQUESTS = 4;

// Local mode: pieces are kept in IndexedDB, which is not limited to the few
// megabytes of localStorage
const LOCAL_DATABASE = 'passager-files';
const LOCAL_STORE = 'chunks';
const LOCAL_CHUNK_BYTES = 256 * 1024;
export const MAX_LOCAL_FILE_BYTES = 50 * 1024 * 1024;

export class FileStorageError extends Error {
    constructor(message = 'The file could not be stored') {
        super(message);
        this.name = 'FileStorageError';
    }
}

// #region Local driver (IndexedDB)
const isLocalStorageAvailable = () => typeof indexedDB !== 'undefined';

const openLocalDatabase = () =>
    new Promise((resolve, reject) => {
        const request = indexedDB.open(LOCAL_DATABASE, 1);
        request.onupgradeneeded = () => {
            const store = request.result.createObjectStore(LOCAL_STORE, {
                keyPath: ['file', 'index'],
            });
            store.createIndex('file', 'file');
            store.createIndex('folder', 'folder');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

/** Runs one operation on the local store and waits for it to be saved. */
const withLocalStore = async (mode, operation) => {
    const database = await openLocalDatabase();
    try {
        return await new Promise((resolve, reject) => {
            const transaction = database.transaction(LOCAL_STORE, mode);
            let result;
            transaction.oncomplete = () => resolve(result);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
            const request = operation(transaction.objectStore(LOCAL_STORE));
            if (request)
                request.onsuccess = () => {
                    result = request.result;
                };
        });
    } finally {
        database.close();
    }
};

const localDriver = {
    createFile: async () => ({
        id: toHex(globalThis.crypto.getRandomValues(new Uint8Array(12))),
    }),
    putChunk: async ({ file, folder, index, data }) => {
        await withLocalStore('readwrite', (store) =>
            store.put({ file, folder, index, data })
        );
        return true;
    },
    getChunk: async ({ file, index }) => {
        const chunk = await withLocalStore('readonly', (store) =>
            store.get([file, index])
        );
        return chunk ? chunk.data : null;
    },
    deleteFile: async (file) => {
        await withLocalStore('readwrite', (store) => {
            const cursor = store.index('file').openKeyCursor(IDBKeyRange.only(file));
            cursor.onsuccess = () => {
                if (!cursor.result) return;
                store.delete(cursor.result.primaryKey);
                cursor.result.continue();
            };
        });
    },
    listFolder: async (folder) => {
        const keys = await withLocalStore('readonly', (store) =>
            store.index('folder').getAllKeys(IDBKeyRange.only(folder))
        );
        return [...new Set((keys || []).map(([file]) => file))].map((id) => ({
            id,
        }));
    },
};

const toHex = (bytes) =>
    Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

/** The pieces stored in this device for some folders, for a backup. */
export const exportLocalFiles = async (folderIds) => {
    if (!isLocalStorageAvailable()) return [];
    const chunks =
        (await withLocalStore('readonly', (store) => store.getAll())) || [];
    return chunks.filter((chunk) => folderIds.includes(chunk.folder));
};

/** Removes the pieces stored in this device for some folders. */
export const removeLocalFolderFiles = async (folderIds) => {
    if (!isLocalStorageAvailable() || folderIds.length === 0) return;
    await withLocalStore('readwrite', (store) => {
        for (const folder of folderIds) {
            const cursor = store
                .index('folder')
                .openKeyCursor(IDBKeyRange.only(folder));
            cursor.onsuccess = () => {
                if (!cursor.result) return;
                store.delete(cursor.result.primaryKey);
                cursor.result.continue();
            };
        }
    });
};

/**
 * Stores the pieces of a backup. Files of other accounts kept in this
 * device are not touched.
 */
export const importLocalFiles = async (chunks) => {
    if (!isLocalStorageAvailable()) return;
    await withLocalStore('readwrite', (store) => {
        for (const chunk of Array.isArray(chunks) ? chunks : []) {
            if (
                chunk &&
                typeof chunk.file === 'string' &&
                Number.isInteger(chunk.index) &&
                typeof chunk.data === 'string'
            )
                store.put({
                    file: chunk.file,
                    folder: `${chunk.folder}`,
                    index: chunk.index,
                    data: chunk.data,
                });
        }
    });
};
// #endregion

// #region Backend driver
const backendDriver = {
    createFile: async ({ folder, owner }) => {
        const file = await createDocument(FILES_COLLECTION, { folder, owner });
        return file && file.id ? { id: file.id } : null;
    },
    putChunk: async ({ file, index, data }) =>
        Boolean(
            await createDocument(FILE_CHUNKS_COLLECTION, { file, index, data })
        ),
    getChunk: async ({ file, index }) => {
        const found = await findDocument(FILE_CHUNKS_COLLECTION, {
            file,
            index,
        });
        return Array.isArray(found) && found.length === 1
            ? found[0].data
            : null;
    },
    deleteFile: async (file) => {
        await deleteDocument(FILES_COLLECTION, file);
    },
    listFolder: async (folder) => {
        const files = await findDocument(FILES_COLLECTION, { folder });
        return Array.isArray(files) ? files : [];
    },
};
// #endregion

const getDriver = () => (isBackendMode() ? backendDriver : localDriver);

/**
 * How large a file can be right now.
 * - `inlineBytes`: up to this size it travels inside the item.
 * - `maxBytes`:    the largest file that can be stored at all.
 * - `chunkBytes`:  size of the pieces, when files can be stored apart.
 */
export const getFileLimits = async () => {
    const inline = {
        inlineBytes: MAX_FILE_BYTES,
        maxBytes: MAX_FILE_BYTES,
        chunkBytes: null,
    };

    if (!isBackendMode()) {
        return isLocalStorageAvailable()
            ? {
                inlineBytes: MAX_FILE_BYTES,
                maxBytes: MAX_LOCAL_FILE_BYTES,
                chunkBytes: LOCAL_CHUNK_BYTES,
            }
            : inline;
    }

    const { files } = await getBackendCapabilities();
    const canStoreApart =
        files &&
        Number.isInteger(files.maxBytes) &&
        Number.isInteger(files.chunkBytes) &&
        files.chunkBytes > 0;

    return canStoreApart
        ? {
            inlineBytes: MAX_FILE_BYTES,
            maxBytes: Math.max(files.maxBytes, MAX_FILE_BYTES),
            chunkBytes: files.chunkBytes,
        }
        : inline;
};

/** Runs tasks with a few of them in flight at a time. */
const runInParallel = async (tasks, limit) => {
    let next = 0;
    const worker = async () => {
        while (next < tasks.length) {
            const index = next++;
            await tasks[index]();
        }
    };
    await Promise.all(
        Array.from({ length: Math.min(limit, tasks.length) }, worker)
    );
};

/**
 * Uploads a file in encrypted pieces.
 *
 * @param {object} params
 * @param {string} params.folderId Folder the file belongs to
 * @param {string} params.folderKey Key of the folder, as it is stored
 * @param {CryptoKey} params.userPrivateKey
 * @param {string} params.owner Identifier of the user
 * @param {string} params.data Content of the file in base64
 * @param {number} params.chunkBytes Size of the pieces
 * @param {Function} [params.onProgress] Called with a number from 0 to 1
 * @returns {Promise<object>} Reference to keep in the item: `{ id, chunks }`
 */
export const uploadFile = async ({
    folderId,
    folderKey,
    userPrivateKey,
    owner,
    data,
    chunkBytes,
    onProgress = () => null,
}) => {
    const aesKey = await importAESKey(folderKey, userPrivateKey);
    const bytes = base64ToBytes(data);
    const chunks = Math.max(1, Math.ceil(bytes.length / chunkBytes));

    const driver = getDriver();
    const file = await driver.createFile({ folder: folderId, owner });
    if (!file || !file.id) throw new FileStorageError();

    try {
        let done = 0;
        onProgress(0);
        await runInParallel(
            Array.from({ length: chunks }, (_, index) => async () => {
                const piece = bytes.subarray(
                    index * chunkBytes,
                    (index + 1) * chunkBytes
                );
                const stored = await driver.putChunk({
                    file: file.id,
                    folder: folderId,
                    index,
                    data: await AESEncryptBytes(piece, aesKey),
                });
                if (!stored) throw new FileStorageError();
                done++;
                onProgress(done / chunks);
            }),
            PARALLEL_REQUESTS
        );
    } catch (e) {
        // Nothing half-uploaded is left behind
        await removeFile({ id: file.id });
        throw e instanceof FileStorageError ? e : new FileStorageError();
    }

    return { id: file.id, chunks };
};

/**
 * Downloads and decrypts a file stored in pieces.
 * @returns {Promise<string>} Content of the file in base64
 */
export const downloadStoredFile = async ({
    folderKey,
    userPrivateKey,
    remote,
    size,
    onProgress = () => null,
}) => {
    const driver = getDriver();
    const aesKey = await importAESKey(folderKey, userPrivateKey);
    const pieces = new Array(remote.chunks);
    let done = 0;
    onProgress(0);

    await runInParallel(
        pieces.fill(null).map((_, index) => async () => {
            const data = await driver.getChunk({ file: remote.id, index });
            if (typeof data !== 'string')
                throw new FileStorageError('A piece of the file is missing');
            pieces[index] = await AESDecryptBytes(data, aesKey);
            done++;
            onProgress(done / remote.chunks);
        }),
        PARALLEL_REQUESTS
    );

    const total = pieces.reduce((sum, piece) => sum + piece.length, 0);
    if (total !== size)
        throw new FileStorageError('The file is not complete');

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const piece of pieces) {
        bytes.set(piece, offset);
        offset += piece.length;
    }
    return bytesToBase64(bytes);
};

/** Removes a stored file. Never throws: there is nothing the user can do. */
export const removeFile = async (remote) => {
    try {
        if (remote && remote.id) await getDriver().deleteFile(remote.id);
    } catch (e) {
        console.error(e);
    }
};

/** Removes every file stored for a folder, before the folder is deleted. */
export const removeFolderFiles = async (folderId) => {
    try {
        const { chunkBytes } = await getFileLimits();
        if (chunkBytes === null) return;
        const files = await getDriver().listFolder(folderId);
        for (const file of files) await removeFile(file);
    } catch (e) {
        console.error(e);
    }
};
