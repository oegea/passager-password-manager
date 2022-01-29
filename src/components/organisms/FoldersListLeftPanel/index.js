// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import LeftPanelList from '../../molecules/LeftPanelList/index.js';
// Organisms
import NewFolderDialog from '../NewFolderDialog/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const FoldersListLeftPanel = ({createFolder, folders, selectedFolder}) => {
    const { t } = useTranslation();
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    return (
        <>
            <SectionTitle title={t('common.Folders')} buttons={[{label: t('common.Create'), onClick: ()=>setShowNewFolderDialog(true)}]}/>
            {
                showNewFolderDialog && 
                <NewFolderDialog 
                    createFolder={createFolder} 
                    closeDialog={()=>setShowNewFolderDialog(false)} 
                /> 
            }
            <LeftPanelList folders={folders} selectedFolder={selectedFolder} />
            
        </>
    )
}

FoldersListLeftPanel.displayName = 'FoldersListLeftPanel';
FoldersListLeftPanel.propTypes = {
    createFolder: PropTypes.func,
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default FoldersListLeftPanel;