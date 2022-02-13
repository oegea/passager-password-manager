// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const LeftPanel = styled.div`
    background: #EDECEC;
    height: calc(100vh - 110px);
    padding: 25px;
    width: 20%;

    @media (max-width: 768px) {
        display: none;
    }
`;

const AtomLeftPanel = ({children}) => {
    return <LeftPanel>{children}</LeftPanel>
}

AtomLeftPanel.displayName = 'AtomLeftPanel';
AtomLeftPanel.propTypes = {
    children: PropTypes.node,
}

export default AtomLeftPanel;