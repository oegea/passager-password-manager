// Third party dependencies
import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
// Atoms
import Dialog from '../../atoms/Dialog/Dialog.js';
import Title from '../../atoms/Title/index.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';

const NewFolderDialog = ({createFolder, closeDialog}) => {
    const [state, setState] = useState({name: '', error: ''});

    const createFolderHandler = useCallback((name) => {
        if (name.length === 0) {
            setState({...state, error: 'Folder name is required'});
            return false;
        }

        createFolder({name});
        return true;
    }, [state, createFolder]);

    const onChangeHandler = (e) => {
        let name = e.target.value;
        let error = '';
        if (name.length === 0) {
            error = 'Folder name is required';
        }
        setState({name, error});
    }

    useEffect(() => {
        const onKeyPress = (e) => {
            const keyCode = e.code || e.key;
            if (
                (keyCode === 'Enter' && createFolderHandler(state.name))
                || keyCode === 'Escape'
            ) {
                closeDialog();
            }
        }
        window.addEventListener('keydown', onKeyPress)
        return () => window.removeEventListener('keydown', onKeyPress)
    },[state, createFolderHandler, closeDialog])

    return (
        <Dialog onClose={() => closeDialog()}>
            <Title marginBottom='20px'>New Folder</Title>
            <InputWrapper>
                <Input 
                    autoFocus
                    type="text" 
                    placeholder="New folder name" 
                    onChange={onChangeHandler}/>
                {state.error.length > 0 && <span style={{color: 'red'}}>{state.error}</span>}
            </InputWrapper>
            
            <ButtonWrapper>
                <Button label="Cancel" onClick={() => closeDialog()} color="black" backgroundColor="white"/>
                <Button label="Create" onClick={() => {
                    if (createFolderHandler(state.name)) 
                        closeDialog();
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