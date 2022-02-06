// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InputLabel = styled.label`
        
`;

const AtomInputLabel = ({htmlFor, children}) => {
    return <InputLabel htmlFor={htmlFor}>{children}</InputLabel>;
}

AtomInputLabel.displayName = 'AtomInputLabel';
AtomInputLabel.propTypes = {
    children: PropTypes.node,
    htmlFor: PropTypes.string,
}

export default AtomInputLabel;