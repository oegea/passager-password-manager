// Third party dependencies
import PropTypes from 'prop-types';
// Organisms
import LeftPanel from '../../organisms/LeftPanel/index.js';
// Templates
import LoggedWithLeftPanel from '../../templates/LoggedWithLeftPanel/index.js';

const PageHome = ({createFolder, deleteFolder, folders, signOut}) => {
    const leftPanel = <LeftPanel 
        createFolder={createFolder} 
        deleteFolder={deleteFolder}
        folders={folders} />;
    return (
        <LoggedWithLeftPanel 
            signOut={signOut} 
            leftPanelContent={leftPanel}>
            <h1>Right</h1>
        </LoggedWithLeftPanel>
    );
}

PageHome.displayName = 'PageHome';
PageHome.propTypes = {
    createFolder: PropTypes.func,
    deleteFolder: PropTypes.func,
    folders: PropTypes.array,
    signOut: PropTypes.func,
};

export default PageHome;