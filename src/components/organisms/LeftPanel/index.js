// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import LeftPanelList from '../../molecules/LeftPanelList/index.js';
// Organisms
import NewFolderDialog from '../NewFolderDialog/index.js';

const LeftPanel = ({createFolder, deleteFolder, folders}) => {
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    return (
        <>
            <SectionTitle title="Folders" buttonLabel="New Folder" onClick={()=>setShowNewFolderDialog(true)}/>
            {
                showNewFolderDialog && 
                <NewFolderDialog 
                    createFolder={createFolder} 
                    closeDialog={()=>setShowNewFolderDialog(false)} 
                /> 
            }
            <LeftPanelList deleteFolder={deleteFolder} folders={folders} />
            
        </>
    )
}

LeftPanel.displayName = 'LeftPanel';
LeftPanel.propTypes = {
    createFolder: PropTypes.func,
    deleteFolder: PropTypes.func,
    folders: PropTypes.array
}

export default LeftPanel;