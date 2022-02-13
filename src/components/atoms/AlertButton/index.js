// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.div`
    background-color: #d32f2f;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    padding: 5px;
    font-weight: 600;

    &:hover{
        background: #ba2929;
    }
`;

const AtomAlertButton = ({label, onClick}) => {
    return <Button 
        onClick={onClick} 
    >{label}</Button>
}

AtomAlertButton.displayName = 'AtomAlertButton';
AtomAlertButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func
}

export default AtomAlertButton;