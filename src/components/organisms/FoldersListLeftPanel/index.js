// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from "react-router-dom";
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import LeftPanelList from '../../molecules/LeftPanelList/index.js';
// Organisms
import NewFolderDialog from '../NewFolderDialog/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libraries
import { createFolder } from '../../../libs/folders.js';
// Context
import withUsers from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';

const FoldersListLeftPanel = ({user, folders, onChange = () => null}) => {
    const {folderId} = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);

    const onCreateFolder = async (folder) => {
        const folderDoc = await createFolder(user, folder)
        if (folderDoc?.id){
            navigate('/' + folderDoc.id);
            onChange();
        } 
    }

    return (
        <>
            <SectionTitle title={t('common.Folders')} buttons={[{label: t('common.Create'), onClick: ()=>setShowNewFolderDialog(true)}]}/>
            {
                showNewFolderDialog && 
                <NewFolderDialog 
                    createFolder={(folder) => onCreateFolder(folder)} 
                    closeDialog={()=>setShowNewFolderDialog(false)} 
                /> 
            }
            <LeftPanelList onChange={onChange} folders={folders} selectedFolder={folderId} />
            
        </>
    )
}

FoldersListLeftPanel.displayName = 'FoldersListLeftPanel';
FoldersListLeftPanel.propTypes = {
    folders: PropTypes.array,
    user: PropTypes.object,
    onChange: PropTypes.func,
}

export default withUsers(withFolders(FoldersListLeftPanel));