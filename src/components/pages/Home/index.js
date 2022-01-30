// Organisms
import FoldersListLeftPanel from '../../organisms/FoldersListLeftPanel/index.js';
import DocumentsListRightPanel from '../../organisms/DocumentsListRightPanel/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
// Templates
import LoggedWithLeftPanel from '../../templates/LoggedWithLeftPanel/index.js';

const PageHome = () => {
    const leftPanel = <FoldersListLeftPanel />;
    return (
        <LoggedWithLeftPanel 
            signOut={logout} 
            leftPanelContent={leftPanel}>
            <DocumentsListRightPanel />
        </LoggedWithLeftPanel>
    );
}

PageHome.displayName = 'PageHome';

export default PageHome;