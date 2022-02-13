// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.div`
    background-color: #f7f7f7;
    border-radius: 10px;
    color: #383838;
    cursor: pointer;
    padding: 5px;
    font-weight: 600;

    &:hover {
        background: #e5e5e5;
    }
`;

const AtomButton = ({label, onClick}) => {
    return <Button onClick={onClick}>{label}</Button>
}

AtomButton.displayName = 'AtomButton';
AtomButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
}

export default AtomButton;