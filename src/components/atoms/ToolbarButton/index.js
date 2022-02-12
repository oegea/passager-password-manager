// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.div`
    background-color: transparent;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    padding: 12px;
    font-weight: 600;

    &:hover{
        border: 2px solid white;
        padding: 10px;
    }
`;

const AtomToolbarButton = ({label, onClick}) => {
    return <Button 
        onClick={onClick} 
    >{label}</Button>
}

AtomToolbarButton.displayName = 'AtomToolbarButton';
AtomToolbarButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func
}

export default AtomToolbarButton;