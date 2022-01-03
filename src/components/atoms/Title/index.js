import styled from 'styled-components';

const AtomTitle = ({ children }) => {
    const Title = styled.div`
        font-size: 22px;
        font-weight: bold;
    `;

    return <Title>{children}</Title>
}

export default AtomTitle;