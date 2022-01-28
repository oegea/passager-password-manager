// Third party dependencies
import PropTypes from 'prop-types';
// Organisms
import FoldersListLeftPanel from '../../organisms/FoldersListLeftPanel/index.js';
import DocumentsListRightPanel from '../../organisms/DocumentsListRightPanel/index.js';
// Templates
import LoggedWithLeftPanel from '../../templates/LoggedWithLeftPanel/index.js';

const PageHome = ({createFolder, deleteFolder, selectedFolder, folders, signOut}) => {
    const leftPanel = <FoldersListLeftPanel 
        createFolder={createFolder} 
        selectedFolder={selectedFolder}
        folders={folders} />;
    return (
        <LoggedWithLeftPanel 
            signOut={signOut} 
            leftPanelContent={leftPanel}>
            <DocumentsListRightPanel 
                deleteFolder={deleteFolder}
                folders={folders}
                selectedFolder={selectedFolder} />
        </LoggedWithLeftPanel>
    );
}

PageHome.displayName = 'PageHome';
PageHome.propTypes = {
    createFolder: PropTypes.func,
    deleteFolder: PropTypes.func,
    selectedFolder: PropTypes.string,
    folders: PropTypes.array,
    signOut: PropTypes.func,
};

export default PageHome;