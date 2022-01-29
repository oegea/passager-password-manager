// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InputWrapper = styled.div`
    width: calc(100% - 10px);
    margin-bottom: ${props => props.marginBottom || 'none'};
`;
const AtomDialogInputWrapper = ({children, marginBottom}) => {
    return <InputWrapper marginBottom={marginBottom}>{children}</InputWrapper>
}

AtomDialogInputWrapper.displayName = 'AtomDialogInputWrapper';
AtomDialogInputWrapper.propTypes = {
    children: PropTypes.node,
    marginBottom: PropTypes.string
}

export default AtomDialogInputWrapper;