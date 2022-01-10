// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Atoms
import Dialog from '../../atoms/Dialog/Dialog.js';
import Title from '../../atoms/Title/index.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';

const NewFolderDialog = ({createFolder, closeDialog}) => {
    const [newFolderName, setNewFolderName] = useState('');
    return (
        <Dialog onClose={() => closeDialog()}>
            <Title marginBottom='20px'>New Folder</Title>
            <InputWrapper>
                <Input type="text" placeholder="New folder name" onChange={e => setNewFolderName(e.target.value)} />
            </InputWrapper>
            
            <ButtonWrapper>
                <Button label="Cancel" onClick={() => closeDialog()} color="black" backgroundColor="white"/>
                <Button label="Create" onClick={() => {
                    closeDialog(); 
                    createFolder({name: newFolderName});
                }} color="black" backgroundColor="white"/>
            </ButtonWrapper>
        </Dialog>
    );
}

NewFolderDialog.displayName = 'NewFolderDialog';
NewFolderDialog.propTypes = {
    createFolder: PropTypes.func,
    closeDialog: PropTypes.func,
}

export default NewFolderDialog;