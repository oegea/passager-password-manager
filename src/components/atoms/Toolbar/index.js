// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AtomToolbar = ({ children }) => {
    const Toolbar = styled.div`
        align-items: center;
        background: black;
        color: white;
        display: flex;
        height: 60px;
        justify-content: space-between;
        margin-bottom: 35px;
        padding-left: 15%;
        padding-right: 15%;
        width: 70%;
    `;

    return <Toolbar>{children}</Toolbar>
}

AtomToolbar.displayName  ='AtomToolbar';
AtomToolbar.propTypes = {
    children: PropTypes.node,
}

export default AtomToolbar;