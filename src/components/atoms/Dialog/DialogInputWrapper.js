// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InputWrapper = styled.div`
    width: calc(100% - 10px);
`;
const AtomDialogInputWrapper = ({children}) => {
    return <InputWrapper>{children}</InputWrapper>
}

AtomDialogInputWrapper.displayName = 'AtomDialogInputWrapper';
AtomDialogInputWrapper.propTypes = {
    children: PropTypes.node,
}

export default AtomDialogInputWrapper;