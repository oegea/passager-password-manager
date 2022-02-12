import PropTypes from 'prop-types';
import styled from 'styled-components';

const DialogBackground = styled.div``;

const SideDialog = styled.div`
    background: white;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    max-height: 100vh;
    max-width: 400px;
    min-height: 100vh;
    overflow: hidden;
    padding: 25px;
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;

    @media (max-width: 768px) {
        width: calc(100% - 50px);
        max-width: calc(100% - 50px);
    }
`;

const AtomSideDialog = ({children, onClose}) => {

    const _isDialogBackground = (element) => {
        const isDialogBackground = element.getAttribute('data-isdialogbackground');
        return (isDialogBackground === 'true');
    }

    return <>
        <DialogBackground data-isdialogbackground="true" onClick={(event) => { 
            if (_isDialogBackground(event.target)) { onClose(); } 
        }}>
            <SideDialog>{children}</SideDialog>
        </DialogBackground>
    </>
}

AtomSideDialog.displayName = 'AtomSideDialog';
AtomSideDialog.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
}

export default AtomSideDialog;