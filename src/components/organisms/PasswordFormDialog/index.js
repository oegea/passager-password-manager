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

const DEFAULT_VALUES = {
    name: '',
    url: '',
    username: '',
    password: ''
}

const PasswordFormDialog = ({defaultValues = DEFAULT_VALUES, onClose, onDelete, onSave}) => {
    const {name, url, username, password} = defaultValues;

    const [state, setState] = useState({
        name: {value: name, error: ''},
        url: {value: url, error: ''},
        username: {value: username, error: ''},
        password: {value: password, error: ''},
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

            // If we're editing, send the id too
            if (defaultValues.id){
                onSave(password, defaultValues.id)
            }
            else{
                onSave(password);
            }
            
        }
        else{
            setState(newState);
        }
            
    }


    useDialogConfirmation(onClose, beforeSave);

    return (
        <SideDialog onClose={()=>onClose()}>
            {
                defaultValues.id ?
                <SectionTitle title={t('passwordFormDialog.Edit password')} buttons={[
                    {backgroundColor: '#ca0000', color: 'white', label: t('common.Delete'), onClick: () => onDelete()},
                ]}/> :
                <SectionTitle title={t('passwordFormDialog.New password')} />
            }

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="name">{t('passwordFormDialog.Password name')}</InputLabel>
                <Input 
                    autoFocus
                    defaultValue={state.name.value} 
                    id="name"
                    onChange={(e) => onChangeHandler(e, 'name')}
                    placeholder={t("passwordFormDialog.My E-mail Account")}
                    type="text"/>
                {state.name.error.length > 0 && <span style={{color: 'red'}}>{state.name.error}</span>}
            </InputWrapper>

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="url">{t('passwordFormDialog.Website URL')}</InputLabel>
                <Input 
                    defaultValue={state.url.value}
                    id="url"
                    type="text" 
                    placeholder="https://gmail.com"
                    onChange={(e) => onChangeHandler(e, 'url')}/>
                {state.url.error.length > 0 && <span style={{color: 'red'}}>{state.url.error}</span>}
            </InputWrapper>

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="username">{t('passwordFormDialog.Username')}</InputLabel>
                <Input 
                    defaultValue={state.username.value}
                    id="username"
                    type="text" 
                    placeholder={t('passwordFormDialog.usernameExample')}
                    onChange={(e) => onChangeHandler(e, 'username')}/>
                {state.username.error.length > 0 && <span style={{color: 'red'}}>{state.username.error}</span>}
            </InputWrapper>

            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="password">{t('passwordFormDialog.Password')}</InputLabel>
                <Input 
                    defaultValue={state.password.value}
                    id="password"
                    type="text"
                    placeholder={t('passwordFormDialog.Your secret password')}
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

PasswordFormDialog.displayName = 'PasswordFormDialog';
PasswordFormDialog.propTypes = {
    defaultValues: PropTypes.object,
    onClose: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func
}

export default PasswordFormDialog;