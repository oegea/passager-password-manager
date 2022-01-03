import styled from 'styled-components';

const AtomToolbar = ({ children }) => {
    const Toolbar = styled.div`
        align-items: center;
        background: black;
        color: white;
        display: flex;
        height: 60px;
        justify-content: space-between;
        padding-left: 15%;
        padding-right: 15%;
        width: 70%;
    `;

    return <Toolbar>{children}</Toolbar>
}

export default AtomToolbar;