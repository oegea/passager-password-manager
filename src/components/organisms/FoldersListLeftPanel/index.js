// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { useParams } from "react-router-dom";
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

const FoldersListLeftPanel = ({user, folders}) => {
    const {folderId} = useParams();
    const { t } = useTranslation();
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    return (
        <>
            <SectionTitle title={t('common.Folders')} buttons={[{label: t('common.Create'), onClick: ()=>setShowNewFolderDialog(true)}]}/>
            {
                showNewFolderDialog && 
                <NewFolderDialog 
                    createFolder={(folder) => createFolder(user, folder)} 
                    closeDialog={()=>setShowNewFolderDialog(false)} 
                /> 
            }
            <LeftPanelList folders={folders} selectedFolder={folderId} />
            
        </>
    )
}

FoldersListLeftPanel.displayName = 'FoldersListLeftPanel';
FoldersListLeftPanel.propTypes = {
    folders: PropTypes.array,
    user: PropTypes.object
}

export default withUsers(withFolders(FoldersListLeftPanel));