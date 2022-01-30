// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import useTranslation from '../../../hooks/useTranslation/index.js';
import styled from 'styled-components';
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

const InputLabel = styled.label`
        
`;

const NewPasswordDialog = ({onClose, onSave}) => {

    const [state, setState] = useState({
        name: {value: '', error: ''},
        url: {value: '', error: ''},
        username: {value: '', error: ''},
        password: {value: '', error: ''},
    });
    const { t } = useTranslation();

    const onChangeHandler = (e, field) => {
        let value = e.target.value;
        let error = checkFieldErrors(value);
        const newState = {...state};
        newState[field] = {value, error};
        setState(newState);
    }

    const checkFieldErrors = (value) => {
        let error = '';
        if (value.length === 0) {
            error = t('common.This field is required');
        } else if (value.length > 50) {
            error = t('common.This field must be less than 50 characters');
        }
        return error;
    }

    const mapStateToObject = () => {
        const object = {};
        Object.keys(state).forEach(key => {
            object[key] = state[key].value;
        });
        return object;
    }

    const beforeSave = () => {
        let save = true;
        const newState = {...state};
        for(let field in newState){
            const { value } = newState[field];
            const error = checkFieldErrors(value);
            if (error.length > 0)
                save = false;
            newState[field] = {value, error};
        }
        if (save){
            const password = mapStateToObject(newState);
            onSave(password);
        }
        else{
            setState(newState);
        }
            
    }


    useDialogConfirmation(onClose, beforeSave);



    return (
        <SideDialog onClose={()=>onClose()}>
            <SectionTitle title={t('newPasswordDialog.New password')} />

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="name">{t('newPasswordDialog.Password name')}</InputLabel>
                <Input 
                    autoFocus
                    id="name"
                    onChange={(e) => onChangeHandler(e, 'name')}
                    placeholder="My E-mail Account" 
                    type="text" />
                {state.name.error.length > 0 && <span style={{color: 'red'}}>{state.name.error}</span>}
            </InputWrapper>

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="url">{t('newPasswordDialog.Website URL')}</InputLabel>
                <Input 
                    id="url"
                    type="text" 
                    placeholder="https://gmail.com"
                    onChange={(e) => onChangeHandler(e, 'url')}/>
                {state.url.error.length > 0 && <span style={{color: 'red'}}>{state.url.error}</span>}
            </InputWrapper>

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="username">{t('newPasswordDialog.Username')}</InputLabel>
                <Input 
                    id="username"
                    type="text" 
                    placeholder={t('newPasswordDialog.usernameExample')}
                    onChange={(e) => onChangeHandler(e, 'username')}/>
                {state.username.error.length > 0 && <span style={{color: 'red'}}>{state.username.error}</span>}
            </InputWrapper>

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="password">{t('newPasswordDialog.Password')}</InputLabel>
                <Input 
                    id="password"
                    type="password"
                    placeholder={t('newPasswordDialog.Your secret password')}
                    onChange={(e) => onChangeHandler(e, 'password')}/>
                {state.password.error.length > 0 && <span style={{color: 'red'}}>{state.password.error}</span>}
            </InputWrapper>
            
            <ButtonWrapper>
                <Button label={t('common.Cancel')} onClick={() => onClose()} color="black" backgroundColor="white"/>
                <Button label={t('common.Save')} onClick={() => beforeSave()} color="black" backgroundColor="white"/>
            </ButtonWrapper>
        </SideDialog>
    )
}

NewPasswordDialog.displayName = 'NewPasswordDialog';
NewPasswordDialog.propTypes = {
    onClose: PropTypes.func,
    onSave: PropTypes.func
}

export default NewPasswordDialog;