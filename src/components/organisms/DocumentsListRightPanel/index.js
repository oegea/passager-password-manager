// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Organisms
import Table from '../Table/index.js'
import ConfirmationDialog from '../ConfirmationDialog/index.js';
import NewPasswordDialog from '../NewPasswordDialog/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const DocumentsListRightPanel = ({deleteFolder, folders = [], selectedFolder}) => {
    let selectedFolderName = null;
    let [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    let [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
    const {t} = useTranslation();

    const onDelete = () => {
        deleteFolder(selectedFolder);
        setShowConfirmationDialog(false);
    }

    folders.forEach(folder => {
        if (folder.id === selectedFolder)
            selectedFolderName = folder.name;
    })

    if (selectedFolderName === null )
        return <h1>{t('documentsListRighPanel.Please, select a folder to start')}</h1>

    return (
        <div>
            <SectionTitle 
                title={selectedFolderName}
                buttons={[
                    {label: t('common.Create'), onClick: ()=>setShowNewPasswordDialog(true)},
                    {backgroundColor: '#ca0000', color: 'white', label: t('documentsListRighPanel.Delete folder'), onClick: () => setShowConfirmationDialog(true)},
                ]}/>
            <Table
                columns={[
                    t("documentsListRighPanel.Title"), 
                    t("documentsListRighPanel.Owner"), 
                    t("documentsListRighPanel.Last modification date")]}
                rows={[]}/>
            {
                showConfirmationDialog && 
                <ConfirmationDialog 
                    onAccept={() => onDelete()} 
                    closeDialog={()=>setShowConfirmationDialog(false)} 
                /> 
            }
            {
                showNewPasswordDialog &&
                <NewPasswordDialog onClose={() => setShowNewPasswordDialog(false)} />
            }
            
        </div>
    )
}

DocumentsListRightPanel.displayName = 'DocumentsListRightPanel';
DocumentsListRightPanel.propTypes = {
    deleteFolder: PropTypes.func,
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default DocumentsListRightPanel;