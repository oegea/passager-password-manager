// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Organisms
import Table from '../../organisms/Table/index.js'

const RightPanel = ({deleteFolder, folders = [], selectedFolder}) => {
    let selectedFolderName;

    folders.forEach(folder => {
        if (folder.id === selectedFolder)
            selectedFolderName = folder.name;
    })

    if (selectedFolder === undefined)
        return <h1>Please, select a folder to start</h1>

    return (
        <div>
            <SectionTitle 
                title={selectedFolderName}
                buttons={[
                    {label: 'Create', onClick: ()=>alert('New password')},
                    {backgroundColor: '#ca0000', color: 'white', label: 'Delete Folder', onClick: () => deleteFolder(selectedFolder)},
                ]}/>
            <Table
                columns={["Title", "Owner", "Last Modification Date"]}
                rows={[]}/>
        </div>
    )
}

RightPanel.displayName = 'RightPanel';
RightPanel.propTypes = {
    deleteFolder: PropTypes.func,
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default RightPanel;