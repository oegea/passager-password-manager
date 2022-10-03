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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
// Organisms
import Table from '../Table/index.js';
import ConfirmationDialog from '../ConfirmationDialog/index.js';
import PasswordFormDialog from '../PasswordFormDialog/index.js';
import FolderFormDialog from '../FolderFormDialog/index.js';
import FolderShareDialog from '../FolderShareDialog/index.js';
// Own libs
import { deleteFolder, editFolder } from '../../../libs/folders.js';
import {
    createPassword,
    decryptPassword,
    deletePassword,
    editPassword,
} from '../../../libs/passwords.js';
import { isMobileDevice } from '../../../libs/mobile.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
import PasswordsProvider, {
    PasswordsContext,
} from '../../../providers/PasswordsProvider.js';

const DocumentsListRightPanel = ({
    user,
    folders = [],
    sharedFolders = [],
}) => {
    const EDIT_INITIAL_STATE = { showDialog: false, password: {} };

    let selectedFolderName = null;
    let selectedFolderSharedEmails = [];
    let selectedFolderKey = null;
    let selectedFolderIsShared = false;
    let [showSpinner, setShowSpinner] = useState(false);
    let [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    let [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
    let [editState, setEditState] = useState(EDIT_INITIAL_STATE);
    let [deleteState, setDeleteState] = useState({
        showDialog: false,
        password: null,
    });
    let [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
    let [showShareFolder, setShowShareFolder] = useState(false);

    const { t } = useTranslation();
    const { folderId } = useParams();
    const selectedFolder = folderId;

    const onDelete = () => {
        deleteFolder(selectedFolder);
        setShowConfirmationDialog(false);
    };

    const onEditFolder = async (folder) => {
        await editFolder(selectedFolder, folder);
        setShowEditFolderDialog(false);
    };

    const onCreateNewPassword = async (password) => {
        setShowSpinner(true);
        await createPassword(
            user,
            selectedFolder,
            password,
            selectedFolderKey,
            user.privateKey
        );
        setShowSpinner(false);
        setShowNewPasswordDialog(false);
    };

    const onClickEditPassword = async (passwords, rowIndex) => {
        const password = await decryptPassword(
            passwords[rowIndex],
            selectedFolderKey,
            user.privateKey
        );
        setShowNewPasswordDialog(false);
        setEditState({ password: password, showDialog: true });
    };

    const onEditPassword = async (password, passwordId) => {
        setShowSpinner(true);
        await editPassword(
            selectedFolder,
            passwordId,
            password,
            selectedFolderKey,
            user.privateKey
        );
        setShowSpinner(false);
        setEditState({ showDialog: false, password: {} });
    };

    const onDeletePassword = () => {
        deletePassword(selectedFolder, editState.password.id);
        setDeleteState({ showDialog: false, password: null });
        setEditState({ showDialog: false, password: {} });
    };

    const _checkSelectedFolder = (shared, folder) => {
        if (folder.id === selectedFolder) {
            selectedFolderName = folder.name;
            selectedFolderSharedEmails = folder.sharedWith || [];
            selectedFolderKey = folder.key;
            selectedFolderIsShared = shared;
        }
    };

    folders.forEach((folder) => _checkSelectedFolder(false, folder));
    sharedFolders.forEach((folder) => _checkSelectedFolder(true, folder));

    if (selectedFolderName === null)
        return (
            <h1>
                {t('documentsListRightPanel.Please, select a folder to start')}
            </h1>
        );

    let sectionButtons = [
        {
            label: t('common.Create'),
            onClick: () => {
                setEditState(EDIT_INITIAL_STATE);
                setShowNewPasswordDialog(true);
            },
        },
    ];
    if (
        selectedFolderIsShared === false &&
        localStorage.getItem('storeMode') !== 'LOCAL'
    ) {
        sectionButtons = [
            ...sectionButtons,
            {
                label: t('documentsListRightPanel.Edit folder'),
                onClick: () => setShowEditFolderDialog(true),
            },
            {
                label: t('documentsListRightPanel.Share folder'),
                onClick: () => setShowShareFolder(true),
            },
            {
                type: 'alert',
                label: t('documentsListRightPanel.Delete folder'),
                onClick: () => setShowConfirmationDialog(true),
            },
        ];
    } else if (localStorage.getItem('storeMode') === 'LOCAL') {
        sectionButtons = [
            ...sectionButtons,
            {
                label: t('documentsListRightPanel.Edit folder'),
                onClick: () => setShowEditFolderDialog(true),
            },
            {
                type: 'alert',
                label: t('documentsListRightPanel.Delete folder'),
                onClick: () => setShowConfirmationDialog(true),
            },
        ];
    }

    return (
        <PasswordsProvider key={selectedFolder} folderId={selectedFolder}>
            <SectionTitle title={selectedFolderName} buttons={sectionButtons} />

            <PasswordsContext.Consumer>
                {(passwords) => {
                    let tableColumns = [t('documentsListRightPanel.Title')];
                    if (!isMobileDevice()) {
                        tableColumns.push(t('documentsListRightPanel.Website'));
                    }

                    const passwordsRows = passwords.map((password) =>
                        !isMobileDevice()
                            ? [password.name, password.url]
                            : [password.name]
                    );
                    return (
                        <Table
                            onClick={(rowIndex) => {
                                onClickEditPassword(passwords, rowIndex);
                            }}
                            columns={tableColumns}
                            rows={passwordsRows}
                        />
                    );
                }}
            </PasswordsContext.Consumer>

            {showConfirmationDialog && (
                <ConfirmationDialog
                    onAccept={() => onDelete()}
                    closeDialog={() => setShowConfirmationDialog(false)}
                    description={t(
                        'documentsListRightPanel.deleteFolderConfirmationDescription'
                    )}
                />
            )}
            {showEditFolderDialog && (
                <FolderFormDialog
                    onSave={(folder) => onEditFolder(folder)}
                    closeDialog={() => setShowEditFolderDialog(false)}
                    defaultName={selectedFolderName}
                />
            )}
            {showShareFolder && (
                <FolderShareDialog
                    closeDialog={() => setShowShareFolder(false)}
                    folderId={selectedFolder}
                    folderName={selectedFolderName}
                    folderKey={selectedFolderKey}
                    sharedWith={selectedFolderSharedEmails}
                    userPrivateKey={user.privateKey}
                />
            )}
            {showNewPasswordDialog && (
                <PasswordFormDialog
                    onClose={() => setShowNewPasswordDialog(false)}
                    onSave={(password) => onCreateNewPassword(password)}
                />
            )}
            {editState.showDialog && (
                <PasswordFormDialog
                    key={editState.password.id}
                    defaultValues={editState.password}
                    onClose={() =>
                        setEditState({ showDialog: false, password: {} })
                    }
                    onDelete={() =>
                        setDeleteState({
                            showDialog: true,
                            password: editState.password.id,
                        })
                    }
                    onSave={(password, passwordId) =>
                        onEditPassword(password, passwordId)
                    }
                    editMode
                />
            )}
            {deleteState.showDialog && (
                <ConfirmationDialog
                    onAccept={() => onDeletePassword()}
                    closeDialog={() =>
                        setDeleteState({ showDialog: false, password: null })
                    }
                    description={t(
                        'documentsListRightPanel.deletePasswordConfirmationDescription'
                    )}
                />
            )}

            {showSpinner && <GlobalSpinner />}
        </PasswordsProvider>
    );
};

DocumentsListRightPanel.displayName = 'DocumentsListRightPanel';
DocumentsListRightPanel.propTypes = {
    user: PropTypes.object,
    folders: PropTypes.array,
    sharedFolders: PropTypes.array,
};

export default withUser(withFolders(DocumentsListRightPanel));
