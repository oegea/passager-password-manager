// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ButtonWrapper = styled.div`
    display: flex;
    margin-top: 25px;
    justify-content: ${props => props.justifyContent};
    width: 100%;
    gap: 15px;
`;
const AtomDialogButtonWrapper = ({children, justifyContent = 'flex-end'}) => {
    return <ButtonWrapper justifyContent={justifyContent}>{children}</ButtonWrapper>
}

AtomDialogButtonWrapper.displayName = 'AtomDialogButtonWrapper';
AtomDialogButtonWrapper.propTypes = {
    children: PropTypes.node,
    justifyContent: PropTypes.string,
}

export default AtomDialogButtonWrapper;