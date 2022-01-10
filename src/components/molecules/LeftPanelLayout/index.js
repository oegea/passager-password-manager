// Third party dependencies
import PropTypes from 'prop-types';
// Atoms
import LeftPanel from '../../atoms/LeftPanel/index.js';
import RightPanel from '../../atoms/RightPanel/index.js';

const OrganismLeftPanelLayout = ({leftPanelContent, children}) => {
    return (
        <>
            <LeftPanel>{leftPanelContent}</LeftPanel>
            <RightPanel>{children}</RightPanel>
        </>
    );
}

OrganismLeftPanelLayout.displayName = 'OrganismLeftPanelLayout';
OrganismLeftPanelLayout.propTypes = {
    leftPanelContent: PropTypes.node,
    children: PropTypes.node,
}

export default OrganismLeftPanelLayout;