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
import styled from 'styled-components';
import {
    mdiFolderOpenOutline,
    mdiPlus,
    mdiShieldLockOutline,
} from '@mdi/js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
import EmptyState from '../../molecules/EmptyState/index.js';
import { getItemRows } from '../../molecules/ItemName/index.js';
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
    wasSaved,
} from '../../../libs/passwords.js';
import { removeFolderFiles } from '../../../libs/fileStorage.js';
import { fromStoredFields, ITEM_TYPE_FILE } from '../../../libs/items.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import useFileStore from '../../../hooks/useFileStore/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
import PasswordsProvider, {
    PasswordsContext,
} from '../../../providers/PasswordsProvider.js';

const Card = styled.div`
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
`;

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

    const onDelete = async () => {
        setShowConfirmationDialog(false);
        // Files stored apart can only be removed while the folder exists
        await removeFolderFiles(selectedFolder);
        deleteFolder(selectedFolder);
    };

    const onEditFolder = async (folder) => {
        await editFolder(selectedFolder, folder);
        setShowEditFolderDialog(false);
    };

    const onCreateNewPassword = async (password) => {
        setShowSpinner(true);
        const saved = await wasSaved(() =>
            createPassword(
                user,
                selectedFolder,
                password,
                selectedFolderKey,
                user.privateKey
            )
        );
        setShowSpinner(false);
        // The dialog stays open with its content if it could not be saved
        if (saved) setShowNewPasswordDialog(false);
        return saved;
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
        const saved = await wasSaved(() =>
            editPassword(
                selectedFolder,
                passwordId,
                password,
                selectedFolderKey,
                user.privateKey
            )
        );
        setShowSpinner(false);
        if (saved) setEditState({ showDialog: false, password: {} });
        return saved;
    };

    const onDeletePassword = () => {
        const item = fromStoredFields(editState.password);
        if (item.type === ITEM_TYPE_FILE && item.values.file?.remote)
            fileStore.remove(item.values.file.remote);
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

    const fileStore = useFileStore({
        folderId: selectedFolder,
        folderKey: selectedFolderKey,
        user,
    });

    if (selectedFolderName === null)
        return (
            <EmptyState
                icon={mdiShieldLockOutline}
                title={t(
                    'documentsListRightPanel.Please, select a folder to start'
                )}
                description={t('items.Select or create a folder')}
            />
        );

    const onClickCreate = () => {
        setEditState(EDIT_INITIAL_STATE);
        setShowNewPasswordDialog(true);
    };

    let sectionButtons = [
        {
            label: t('common.Create'),
            variant: 'primary',
            icon: mdiPlus,
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
                    const tableColumns = [
                        t('documentsListRightPanel.Title'),
                        t('documentsListRightPanel.Website'),
                    ];

                    if (passwords.length === 0)
                        return (
                            <EmptyState
                                icon={mdiFolderOpenOutline}
                                title={t('items.This folder is empty')}
                                description={t('items.emptyFolderDescription')}
                                action={{
                                    label: t('items.Add the first item'),
                                    icon: mdiPlus,
                                    onClick: onClickCreate,
                                }}
                            />
                        );

                    return (
                        <Card>
                            <Table
                                onClick={(rowIndex) => {
                                    onClickEditPassword(passwords, rowIndex);
                                }}
                                columns={tableColumns}
                                rows={getItemRows(passwords, t)}
                            />
                        </Card>
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
                    fileStore={fileStore}
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
                    fileStore={fileStore}
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
