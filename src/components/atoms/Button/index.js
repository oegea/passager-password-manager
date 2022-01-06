// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AtomButton = ({label, onClick, color, backgroundColor, padding = "10px"}) => {
    const Button = styled.div`
        background-color: ${backgroundColor};
        border: 1px solid ${color};
        border-radius: 5px;
        color: ${color};
        cursor: pointer;
        padding: ${padding};
    `;

    return <Button onClick={onClick}>{label}</Button>
}

AtomButton.displayName = 'AtomButton';
AtomButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    padding: PropTypes.string,
}

export default AtomButton;