import React, {useState} from 'react';
import PropTypes from 'prop-types';
// Atoms
import SideDialog from '../../atoms/SideDialog/index.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';

const NewDocumentDialog = ({onClose}) => {
    const [state, setState] = useState({
        name: {value: '', error: ''}
    });
    useDialogConfirmation(onClose, onClose);

    const onChangeHandler = (e, field) => {
        let value = e.target.value;
        let error = '';
        if (value.length === 0) {
            error = 'Document name is required';
        }
        setState({...state, name: {value, error}});
    }

    return (
        <SideDialog onClose={()=>onClose()}>
            <SectionTitle title="New Document" />

            <InputWrapper>
                <Input 
                    autoFocus
                    type="text" 
                    placeholder="Document name" 
                    onChange={(e) => onChangeHandler(e, 'name')}/>
                {state.name.error.length > 0 && <span style={{color: 'red'}}>{state.name.error}</span>}
            </InputWrapper>
            <ButtonWrapper>
                <Button label="Cancel" onClick={() => onClose()} color="black" backgroundColor="white"/>
                <Button label="Save" onClick={() => onClose()} color="black" backgroundColor="white"/>
            </ButtonWrapper>
        </SideDialog>
    )
}

NewDocumentDialog.displayName = 'NewDocumentDialog';
NewDocumentDialog.propTypes = {
    onClose: PropTypes.func,
}

export default NewDocumentDialog;