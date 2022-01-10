// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

// 110px = 60px from header + 25px*2 (top and bottom) from padding
const RightPanel = styled.div`
    background: white;
    height: calc(100vh - 110px);
    padding: 25px;
    overflow-y: auto;
    overflow-z: none;
    width: 80%;
`;

const AtomRightPanel = ({children}) => {
    return <RightPanel>{children}</RightPanel>
}

AtomRightPanel.displayName = 'AtomLeftPanel';
AtomRightPanel.propTypes = {
    children: PropTypes.node,
}

export default AtomRightPanel;