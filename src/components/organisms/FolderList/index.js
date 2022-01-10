// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Organisms
import NewFolderDialog from '../NewFolderDialog/index.js';

const FolderList = ({createFolder}) => {
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
        </>
    )
}

FolderList.displayName = 'FolderList';
FolderList.propTypes = {
    createFolder: PropTypes.func,
}

export default FolderList;