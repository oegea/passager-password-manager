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
import { createPassword, deletePassword, editPassword } from '../../../libs/passwords.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
import PasswordsProvider, {PasswordsContext} from '../../../providers/PasswordsProvider.js'

const DocumentsListRightPanel = ({ user, folders = [] }) => {
    let selectedFolderName = null;
    let selectedFolderKey = null;
    let [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    let [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
    let [editState, setEditState] = useState({showDialog: false, password: {}});
    let [deleteState, setDeleteState] = useState({showDialog: false, password: null});

    const {t} = useTranslation();
    const {folderId} = useParams();
    const selectedFolder = folderId;

    const onDelete = () => {
        deleteFolder(selectedFolder);
        setShowConfirmationDialog(false);
    }

    const onCreateNewPassword = async (password) => {
        createPassword(user, selectedFolder, password, selectedFolderKey, user.privateKey);
        setShowNewPasswordDialog(false);
    }

    const onEditPassword = (password, passwordId) => {
        editPassword(selectedFolder, passwordId, password);
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
            
        </PasswordsProvider>
    )
}

DocumentsListRightPanel.displayName = 'DocumentsListRightPanel';
DocumentsListRightPanel.propTypes = {
    user: PropTypes.object,
    folders: PropTypes.array
}

export default withUser(withFolders(DocumentsListRightPanel));