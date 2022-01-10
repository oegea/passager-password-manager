// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Toolbar = styled.div`
    align-items: center;
    background: black;
    color: white;
    display: flex;
    height: 60px;
    justify-content: space-between;
    margin-bottom: ${props => props.marginBottom};
    padding-left: 15%;
    padding-right: 15%;
    width: 70%;
`;

const AtomToolbar = ({ children, marginBottom = '35px' }) => {
    return <Toolbar marginBottom={marginBottom}>{children}</Toolbar>
}

AtomToolbar.displayName  ='AtomToolbar';
AtomToolbar.propTypes = {
    children: PropTypes.node,
    marginBottom: PropTypes.string,
}

export default AtomToolbar;