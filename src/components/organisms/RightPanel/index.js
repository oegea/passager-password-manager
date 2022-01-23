// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';

const RightPanel = ({folders = [], selectedFolder}) => {
    let selectedFolderName = 'Welcome';

    folders.forEach(folder => {
        if (folder.id === selectedFolder)
            selectedFolderName = folder.name;
    })
    return (
        <div>
            <SectionTitle 
                title={selectedFolderName}
                buttons={[
                    {label: 'New', onClick: ()=>alert('New password')},
                    {color: 'red', label: 'Delete Folder', onClick: ()=>alert('Delete password')},
                ]}/>
        </div>
    )
}

RightPanel.displayName = 'RightPanel';
RightPanel.propTypes = {
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default RightPanel;