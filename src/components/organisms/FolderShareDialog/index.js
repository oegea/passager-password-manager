/** 
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 * 
 * Copyright (C) 2022 Oriol Egea Carvajal
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Third party dependencies
import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
// Atoms
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Dialog from '../../atoms/Dialog/Dialog.js';
import Input from '../../atoms/Input/index.js';
import InputLabel from '../../atoms/InputLabel/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import Title from '../../atoms/Title/index.js';
// Molecules
import FolderShareNotice from '../../molecules/FolderShareNotice/index.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';
import useTranslation from '../../../hooks/useTranslation/index.js';

const FolderShareDialog = ({defaultValues = '', onSave, closeDialog}) => {
    const { t } = useTranslation();
    const [state, setState] = useState({email: '', error: ''});

    const onSaveHandler = useCallback((email) => {
        if (email.length === 0) {
            setState({...state, error: t('folderShareDialog.Folder name is required')});
            return false;
        }

        onSave({email});
        return true;
    }, [state, onSave, t]);

    const onChangeHandler = (e) => {
        let email = e.target.value;
        let error = '';

        setState({email, error});
    }

    useDialogConfirmation(closeDialog, onSaveHandler, state.name);

    return (
        <Dialog onClose={() => closeDialog()}>
            <Title marginBottom='20px'>
                {t('folderShareDialog.Share Folder')}
            </Title>
            <InputWrapper>
                <InputLabel htmlFor="email">{t('folderShareDialog.Add people by typing their email')}</InputLabel>
                <Input 
                    autoFocus
                    defaultValue={state.email}
                    id="email"
                    type="text" 
                    placeholder={t('folderShareDialog.Email')}
                    onChange={onChangeHandler}/>
                {state.error.length > 0 && <span style={{color: 'red'}}>{state.error}</span>}
            </InputWrapper>

            {
                state.email.length > 0 &&
                <FolderShareNotice email={state.email}/>
            }
            
            <ButtonWrapper>
                <Button label={t('common.Cancel')} onClick={() => closeDialog()} color="black" backgroundColor="white"/>
                <Button label={t('common.Save')} onClick={() => {
                    if (onSaveHandler(state.name)) 
                        closeDialog();
                }} color="black" backgroundColor="white"/>
            </ButtonWrapper>
        </Dialog>
    );
}

FolderShareDialog.displayName = 'FolderShareDialog';
FolderShareDialog.propTypes = {
    onSave: PropTypes.func,
    closeDialog: PropTypes.func,
    defaultValues: PropTypes.string
}

export default FolderShareDialog;