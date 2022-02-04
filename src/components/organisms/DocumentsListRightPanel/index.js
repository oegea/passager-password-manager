// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { useParams } from "react-router-dom";
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Organisms
import Table from '../Table/index.js'
import ConfirmationDialog from '../ConfirmationDialog/index.js';
import PasswordFormDialog from '../PasswordFormDialog/index.js';
// Own libs
import { deleteFolder } from '../../../libs/folders.js';
import { createPassword, editPassword } from '../../../libs/passwords.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
import PasswordsProvider, {PasswordsContext} from '../../../providers/PasswordsProvider.js'

const DocumentsListRightPanel = ({ user, folders = [] }) => {
    let selectedFolderName = null;
    let [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    let [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
    let [editState, setEditState] = useState({showDialog: false, password: {}});
    const {t} = useTranslation();
    const {folderId} = useParams();
    const selectedFolder = folderId;

    const onDelete = () => {
        deleteFolder(selectedFolder);
        setShowConfirmationDialog(false);
    }

    const onCreateNewPassword = (password) => {
        createPassword(user, selectedFolder, password);
        setShowNewPasswordDialog(false);
    }

    const onEditPassword = (password, passwordId) => {
        editPassword(selectedFolder, passwordId, password);
        setEditState({showDialog: false, password: {}});
    }

    folders.forEach(folder => {
        if (folder.id === selectedFolder)
            selectedFolderName = folder.name;
    })

    if (selectedFolderName === null )
        return <h1>{t('documentsListRighPanel.Please, select a folder to start')}</h1>

    return (
        <PasswordsProvider folderId={selectedFolder}>
            <SectionTitle 
                title={selectedFolderName}
                buttons={[
                    {label: t('common.Create'), onClick: ()=>setShowNewPasswordDialog(true)},
                    {backgroundColor: '#ca0000', color: 'white', label: t('documentsListRighPanel.Delete folder'), onClick: () => setShowConfirmationDialog(true)},
                ]}/>
            
            <PasswordsContext.Consumer>
                {passwords => {
                    const passwordsRows = passwords.map((password) => [password.name, password.url, password.username])
                    return <Table
                        onClick={(rowIndex)=>{setEditState({ password: passwords[rowIndex], showDialog: true})}}
                        columns={[
                            t("documentsListRighPanel.Title"), 
                            t("documentsListRighPanel.Website"), 
                            t("documentsListRighPanel.Username")]}
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
                    onSave={(password, passwordId) => onEditPassword(password, passwordId)} />
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