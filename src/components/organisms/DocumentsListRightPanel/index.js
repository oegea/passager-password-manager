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
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { useParams } from "react-router-dom";
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
// Organisms
import Table from '../Table/index.js'
import ConfirmationDialog from '../ConfirmationDialog/index.js';
import PasswordFormDialog from '../PasswordFormDialog/index.js';
import FolderFormDialog from '../FolderFormDialog/index.js';
// Own libs
import { deleteFolder, editFolder } from '../../../libs/folders.js';
import { createPassword, decryptPassword, deletePassword, editPassword } from '../../../libs/passwords.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
import PasswordsProvider, {PasswordsContext} from '../../../providers/PasswordsProvider.js'

const DocumentsListRightPanel = ({ user, folders = [] }) => {
    const EDIT_INITIAL_STATE = { showDialog: false, password: {}};
    
    let selectedFolderName = null;
    let selectedFolderKey = null;
    let [showSpinner, setShowSpinner] = useState(false);
    let [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    let [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
    let [editState, setEditState] = useState(EDIT_INITIAL_STATE);
    let [deleteState, setDeleteState] = useState({showDialog: false, password: null});
    let [showEditFolderDialog, setShowEditFolderDialog] = useState(false);

    const {t} = useTranslation();
    const {folderId} = useParams();
    const selectedFolder = folderId;

    const onDelete = () => {
        deleteFolder(selectedFolder);
        setShowConfirmationDialog(false);
    }

    const onEditFolder = async (folder) => {
       await editFolder(selectedFolder, folder);
       setShowEditFolderDialog(false);
    }

    const onCreateNewPassword = async (password) => {
        setShowSpinner(true);
        await createPassword(user, selectedFolder, password, selectedFolderKey, user.privateKey);
        setShowSpinner(false);
        setShowNewPasswordDialog(false);
    }

    const onClickEditPassword = async (passwords, rowIndex) => {
        const password = await decryptPassword(passwords[rowIndex], selectedFolderKey, user.privateKey);
        setShowNewPasswordDialog(false);
        setEditState({ password: password, showDialog: true})
    }

    const onEditPassword = async (password, passwordId) => {
        setShowSpinner(true);
        await editPassword(selectedFolder, passwordId, password, selectedFolderKey, user.privateKey);
        setShowSpinner(false);
        setEditState({showDialog: false, password: {}});
    }

    const onDeletePassword = () => {
        deletePassword(selectedFolder, editState.password.id);
        setDeleteState({showDialog: false, password: null});
        setEditState({showDialog: false, password: {}});
    }

    folders.forEach(folder => {
        if (folder.id === selectedFolder){
            selectedFolderName = folder.name;
            selectedFolderKey = folder.key;
        }  
    })

    if (selectedFolderName === null )
        return <h1>{t('documentsListRighPanel.Please, select a folder to start')}</h1>

    return (
        <PasswordsProvider key={folderId} folderId={selectedFolder}>
            <SectionTitle 
                title={selectedFolderName}
                buttons={[
                    {label: t('common.Create'), onClick: ()=>{setEditState(EDIT_INITIAL_STATE); setShowNewPasswordDialog(true)}},
                    {label: t('documentsListRighPanel.Edit folder'), onClick: () => setShowEditFolderDialog(true)},
                    {type: 'alert', label: t('documentsListRighPanel.Delete folder'), onClick: () => setShowConfirmationDialog(true)},
                ]}/>
            
            <PasswordsContext.Consumer>
                {passwords => {
                    const passwordsRows = passwords.map((password) => [password.name, password.url])
                    return <Table
                        onClick={(rowIndex)=>{onClickEditPassword(passwords, rowIndex)}}
                        columns={[
                            t("documentsListRighPanel.Title"), 
                            t("documentsListRighPanel.Website")]}
                        rows={passwordsRows}/>
                }
                }
            </PasswordsContext.Consumer>
            
            {
                showConfirmationDialog && 
                <ConfirmationDialog 
                    onAccept={() => onDelete()} 
                    closeDialog={()=>setShowConfirmationDialog(false)} 
                /> 
            }
            {
                showEditFolderDialog &&
                <FolderFormDialog 
                    onSave={(folder) => onEditFolder(folder)} 
                    closeDialog={()=>setShowEditFolderDialog(false)} 
                    defaultName={selectedFolderName}
                /> 
            }
            {
                showNewPasswordDialog &&
                <PasswordFormDialog 
                    onClose={() => setShowNewPasswordDialog(false)} 
                    onSave={(password) => onCreateNewPassword(password)} />
            }
            {
                editState.showDialog &&
                <PasswordFormDialog 
                    key={editState.password.id}
                    defaultValues={editState.password}
                    onClose={() => setEditState({showDialog: false, password: {}})} 
                    onDelete={() => setDeleteState({showDialog: true, password: editState.password.id})}
                    onSave={(password, passwordId) => onEditPassword(password, passwordId)} />
            }
            {
                deleteState.showDialog &&
                <ConfirmationDialog 
                    onAccept={() => onDeletePassword()} 
                    closeDialog={()=>setDeleteState({showDialog: false, password: null})} 
                /> 
            }

            {
                showSpinner && 
                <GlobalSpinner />
            }
            
        </PasswordsProvider>
    )
}

DocumentsListRightPanel.displayName = 'DocumentsListRightPanel';
DocumentsListRightPanel.propTypes = {
    user: PropTypes.object,
    folders: PropTypes.array
}

export default withUser(withFolders(DocumentsListRightPanel));