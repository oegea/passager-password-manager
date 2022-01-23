// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import LeftPanelList from '../../molecules/LeftPanelList/index.js';
// Organisms
import NewFolderDialog from '../NewFolderDialog/index.js';

const LeftPanel = ({createFolder, folders, selectedFolder}) => {
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    return (
        <>
            <SectionTitle title="Folders" buttons={[{label: 'Create', onClick: ()=>setShowNewFolderDialog(true)}]}/>
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

LeftPanel.displayName = 'LeftPanel';
LeftPanel.propTypes = {
    createFolder: PropTypes.func,
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default LeftPanel;