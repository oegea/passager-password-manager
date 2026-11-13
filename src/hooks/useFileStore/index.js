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

// Third party dependencies
import { useEffect, useMemo, useState } from 'react';
// Own libs
import {
    downloadStoredFile,
    getFileLimits,
    removeFile,
    uploadFile,
} from '../../libs/fileStorage.js';
import {
    getContentBytesForFile,
    MAX_CONTENT_BYTES,
    MAX_FILE_BYTES,
} from '../../libs/items.js';

/**
 * Everything the item form needs to keep files in a folder: how large they
 * can be here, and how to store, fetch and remove the large ones.
 */
const useFileStore = ({ folderId, folderKey, user }) => {
    const [limits, setLimits] = useState({
        inlineBytes: MAX_FILE_BYTES,
        maxBytes: MAX_FILE_BYTES,
        chunkBytes: null,
    });

    useEffect(() => {
        let isCurrent = true;
        getFileLimits().then((result) => isCurrent && setLimits(result));
        return () => {
            isCurrent = false;
        };
    }, []);

    const userPrivateKey = user ? user.privateKey : null;
    const owner = user ? user.uid : null;

    return useMemo(
        () => ({
            ...limits,
            // Room an item needs to carry the largest file it may hold inside
            maxContentBytes: Math.max(
                MAX_CONTENT_BYTES,
                getContentBytesForFile(limits.inlineBytes)
            ),
            upload: (file, onProgress) =>
                uploadFile({
                    folderId,
                    folderKey,
                    userPrivateKey,
                    owner,
                    data: file.data,
                    chunkBytes: limits.chunkBytes,
                    onProgress,
                }),
            download: (file, onProgress) =>
                downloadStoredFile({
                    folderKey,
                    userPrivateKey,
                    remote: file.remote,
                    size: file.size,
                    onProgress,
                }),
            remove: (remote) => removeFile(remote),
        }),
        [limits, folderId, folderKey, userPrivateKey, owner]
    );
};

export default useFileStore;
