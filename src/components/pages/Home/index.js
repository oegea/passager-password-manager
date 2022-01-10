// Third party dependencies
import PropTypes from 'prop-types';
// Organisms
import FolderList from '../../organisms/FolderList/index.js';
// Templates
import LoggedWithLeftPanel from '../../templates/LoggedWithLeftPanel/index.js';

const PageHome = ({signOut}) => {
    return (
        <LoggedWithLeftPanel signOut={signOut} leftPanelContent={<FolderList />}>
            <h1>Right</h1>
        </LoggedWithLeftPanel>
    );
}

PageHome.displayName = 'PageHome';
PageHome.propTypes = {
    signOut: PropTypes.func,
};

export default PageHome;