import styled from 'styled-components';

const AtomButton = ({label, onClick, color, backgroundColor, padding = "10px"}) => {
    const Button = styled.div`
        background-color: ${backgroundColor};
        border: 1px solid ${color};
        border-radius: 5px;
        cursor: pointer;
        padding: ${padding};
    `;

    return <Button onClick={onClick}>{label}</Button>
}

export default AtomButton;