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
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { mdiDownload, mdiFileOutline, mdiTrayArrowUp } from '@mdi/js';
// Atoms
import Button from '../../atoms/Button/index.js';
import Icon from '../../atoms/Icon/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import {
    downloadFile,
    formatBytes,
    ItemTooLargeError,
    MAX_FILE_BYTES,
    readFile,
} from '../../../libs/items.js';

const DropZone = styled.div`
    align-items: center;
    background: var(--color-surface-sunken);
    border: 1.5px dashed var(--color-border-strong);
    border-radius: var(--radius-lg);
    color: var(--color-text-muted);
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 24px 16px;
    text-align: center;
    transition: border-color var(--duration-fast) ease,
        background-color var(--duration-fast) ease;

    &[data-dragging='true'] {
        background: var(--color-accent-soft);
        border-color: var(--color-accent);
    }
`;

const FileName = styled.div`
    align-items: center;
    color: var(--color-text);
    display: flex;
    font-weight: 600;
    gap: 8px;
    max-width: 100%;

    & span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const Hint = styled.div`
    font-size: 13px;
`;

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
`;

const Progress = styled.div`
    background: var(--color-surface-active);
    border-radius: var(--radius-full);
    height: 6px;
    overflow: hidden;
    width: 100%;
`;

const ProgressBar = styled.div`
    background: var(--color-accent);
    border-radius: var(--radius-full);
    height: 100%;
    transition: width var(--duration-base) ease;
`;

const HiddenInput = styled.input`
    display: none;
`;

/**
 * Lets the user attach a small file, and download the one already stored.
 * `value` is `{ name, mime, size, data }` or null.
 */
const MoleculeFileField = ({
    value,
    onChange,
    onError,
    canDownload = true,
    maxBytes = MAX_FILE_BYTES,
    onDownload,
    progress = null,
}) => {
    const { t } = useTranslation();
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const maxSize = formatBytes(maxBytes);

    const download = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            if (onDownload) await onDownload(value);
            else downloadFile(value);
        } catch (e) {
            onError(t('items.The file could not be downloaded'));
        }
        setIsDownloading(false);
    };

    const loadFile = async (file) => {
        if (!file) return;
        try {
            onChange(await readFile(file, maxBytes));
        } catch (e) {
            onError(
                e instanceof ItemTooLargeError
                    ? t('items.The file is too large', { max: maxSize })
                    : t('items.The file could not be read')
            );
        }
    };

    return (
        <DropZone
            data-testid="file-field"
            data-dragging={isDragging}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                loadFile(e.dataTransfer.files[0]);
            }}
        >
            {value ? (
                <FileName>
                    <Icon path={mdiFileOutline} size={0.8} />
                    <span data-testid="file-field-name">{value.name}</span>
                </FileName>
            ) : (
                <Icon path={mdiTrayArrowUp} size={1.2} />
            )}
            <Hint>
                {value
                    ? formatBytes(value.size)
                    : t('items.Drop a file here or choose one', {
                        max: maxSize,
                    })}
            </Hint>
            <Actions>
                <Button
                    label={
                        value
                            ? t('items.Replace file')
                            : t('items.Choose file')
                    }
                    onClick={() => inputRef.current.click()}
                />
                {value && canDownload && (
                    <Button
                        label={t('items.Download')}
                        icon={mdiDownload}
                        variant="primary"
                        disabled={isDownloading}
                        onClick={download}
                    />
                )}
            </Actions>
            {progress !== null && (
                <Progress
                    role="progressbar"
                    aria-valuenow={Math.round(progress * 100)}
                    data-testid="file-field-progress"
                >
                    <ProgressBar style={{ width: `${progress * 100}%` }} />
                </Progress>
            )}
            <HiddenInput
                ref={inputRef}
                type="file"
                data-testid="file-field-input"
                onChange={(e) => {
                    loadFile(e.target.files[0]);
                    e.target.value = '';
                }}
            />
        </DropZone>
    );
};

MoleculeFileField.displayName = 'MoleculeFileField';
MoleculeFileField.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    canDownload: PropTypes.bool,
    maxBytes: PropTypes.number,
    onDownload: PropTypes.func,
    progress: PropTypes.number,
};

export default MoleculeFileField;
