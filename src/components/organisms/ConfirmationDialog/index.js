// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
// Atoms
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Dialog from '../../atoms/Dialog/Dialog.js';
import Title from '../../atoms/Title/index.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';

const ConfirmationDialog = ({onAccept, closeDialog}) => {

    useDialogConfirmation(closeDialog, onAccept);

    return (
        <Dialog onClose={() => closeDialog()}>
            <Title marginBottom='75px'>Are you sure you want to proceed?</Title>
            
            <ButtonWrapper>
                <Button label="Cancel" onClick={() => closeDialog()} color="black" backgroundColor="white"/>
                <Button label="Accept" onClick={() => onAccept()} color="black" backgroundColor="white"/>
            </ButtonWrapper>
        </Dialog>
    );
}

ConfirmationDialog.displayName = 'ConfirmationDialog';
ConfirmationDialog.propTypes = {
    onAccept: PropTypes.func,
    closeDialog: PropTypes.func,
}

export default ConfirmationDialog;