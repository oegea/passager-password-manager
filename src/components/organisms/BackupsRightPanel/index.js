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
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
import Toast from '../../molecules/Toast/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import useToast from '../../../hooks/useToast/index.js';
// Own libs
import { downloadBackup, importBackup } from '../../../libs/backups.js';

const FileSelector = styled.input`
    display: none;
`;

const ErrorMessage = styled.p`
    color: red;
    font-weight: bold;
    margin-bottom: 30px;
`;

const UserDetailsRightPanel = () => {
    const { t } = useTranslation();
    const uploadBackupRef = useRef(null);
    const [backupImportError, setBackupImportError] = useState(false);
    const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
    const [backupDownloadError, setBackupDownloadError] = useState(false);
    const { toasts, showToast, removeToast } = useToast();

    const isLocalMode = localStorage.getItem('storeMode') === 'LOCAL';

    const showFile = async (e) => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            loadBackup(text);
        };
        reader.readAsText(e.target.files[0]);
    };

    const loadBackup = async (backupData) => {
        const backupImportResult = await importBackup({ backupData });

        if (backupImportResult) window.location.reload();
        else setBackupImportError(true);
    };

    const handleDownloadBackup = async () => {
        if (isDownloadingBackup) return;
        setBackupDownloadError(false);
        setIsDownloadingBackup(true);
        try {
            await downloadBackup();
            showToast(t('profile.Backup downloaded successfully'));
        } catch (error) {
            setBackupDownloadError(true);
        } finally {
            setIsDownloadingBackup(false);
        }
    };

    return (
        <>
            <SectionTitle
                title={t('profile.Backups')}
                buttons={
                    isLocalMode
                        ? [
                            {
                                label: isDownloadingBackup
                                    ? t('profile.Downloading backup...')
                                    : t('profile.Download Backup'),
                                onClick: handleDownloadBackup,
                            },
                            {
                                label: t('profile.Import Backup'),
                                onClick: () =>
                                    uploadBackupRef.current.click(),
                                type: backupImportError
                                    ? 'alert'
                                    : 'button',
                            },
                        ]
                        : [
                            {
                                label: isDownloadingBackup
                                    ? t('profile.Downloading backup...')
                                    : t('profile.Download Backup'),
                                onClick: handleDownloadBackup,
                            },
                        ]
                }
            />

            {isLocalMode ? (
                <FileSelector
                    ref={uploadBackupRef}
                    type="file"
                    accept="application/JSON"
                    onChange={(e) => showFile(e)}
                />
            ) : null}

            {backupImportError ? (
                <ErrorMessage>
                    {t(
                        'profile.Error importing data. Submitted file is not a valid backup'
                    )}
                </ErrorMessage>
            ) : null}
            {backupDownloadError ? (
                <ErrorMessage>
                    {t('profile.Error downloading backup. Please try again')}
                </ErrorMessage>
            ) : null}
            {isDownloadingBackup && <GlobalSpinner />}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
            {isLocalMode ? (
                <>
                    <p>
                        {t(
                            'profile.When you store your passwords locally, they are saved in the local storage of your Internet browser'
                        )}
                    </p>
                    <p>
                        {t(
                            'profile.There are certain browser cleaning operations that may delete this information, and may cause you to lose your passwords'
                        )}
                    </p>
                    <p>
                        {t(
                            'profile.It is therefore recommended to regularly download backups via this page and store them on a secure storage device'
                        )}
                    </p>
                    <p>
                        <strong>
                            {t(
                                'profile.In case you accidentally delete your data, you can upload a backup copy by clicking on the "Import backup copy" button'
                            )}
                        </strong>
                    </p>
                    <p>
                        {t(
                            'profile.In addition, you can upload your backups to other computers to have your passwords available on different devices'
                        )}
                    </p>
                </>
            ) : (
                <>
                    <p>
                        {t(
                            'profile.The backup includes only folders you own. Folders shared with you are excluded'
                        )}
                    </p>
                    <p>
                        {t(
                            'profile.Importing this backup back into a backend instance is not supported yet, but the file can be imported in local mode'
                        )}
                    </p>
                </>
            )}
        </>
    );
};

UserDetailsRightPanel.displayName = 'UserDetailsRightPanel';
UserDetailsRightPanel.propTypes = {};

export default UserDetailsRightPanel;
