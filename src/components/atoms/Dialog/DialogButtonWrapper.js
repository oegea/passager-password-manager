// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AtomDialogButtonWrapper = ({children}) => {
    const ButtonWrapper = styled.div`
        display: flex;
        margin-top: 25px;
        justify-content: flex-end;
        width: 100%;
        gap: 15px;
    `;

    return <ButtonWrapper>{children}</ButtonWrapper>
}

AtomDialogButtonWrapper.displayName = 'AtomDialogButtonWrapper';
AtomDialogButtonWrapper.propTypes = {
    children: PropTypes.node,
}

export default AtomDialogButtonWrapper;