// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.div`
    background-color: ${props => props.backgroundColor};
    border: 1px solid ${props => props.color};
    border-radius: 5px;
    color: ${props => props.color};
    cursor: pointer;
    padding: ${props => props.padding};
`;

const AtomButton = ({label, onClick, color, backgroundColor, padding = "10px"}) => {
    return <Button 
        backgroundColor={backgroundColor}
        color={color}
        onClick={onClick} 
        padding={padding}
    >{label}</Button>
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