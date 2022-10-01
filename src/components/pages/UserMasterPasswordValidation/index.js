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
import React, {useState, useEffect, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
import { loginWithCredentialsIfAvailable, setCredentials } from '../../../libs/biometric.js';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import AtomButtonLink from '../../atoms/ButtonLink/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../atoms/InputLabel/index.js';
// Molecules
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';
import AtomLanguageSelector from '../../atoms/LanguageSelector/index.js';

const PageUserMasterPasswordValidation = ({user}) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState({
        value: '',
        error: ''
    });
    const biometricAuthTried = useRef(false);

    const [displaySpinner, setDisplaySpinner] = useState(false);

    const onLogin = useCallback(async (overridedPassword) => {
        if (overridedPassword)
            password.value = overridedPassword;

        if (displaySpinner) { return; }
        setDisplaySpinner(true);
        const decryptResult = await user.decryptPrivateKey(password.value);
        let error = '';
         
        if (decryptResult === false) {
            error = t('userMasterPasswordValidation.The entered password is not valid');
        }
        
        setCredentials(password.value)

        setDisplaySpinner(false);
        setPassword({
            value: password.value,
            error
        } );
        
    }, [displaySpinner, password, t, user])

    useEffect(()=>{
        if (!biometricAuthTried.current) {
            loginWithCredentialsIfAvailable().then(
                (password) => password !== null && onLogin(password)
            );
            biometricAuthTried.current = true;
        }
    });

    useDialogConfirmation(()=>null, onLogin);

    return <>
        <NotLogged>
            {displaySpinner && <GlobalSpinner /> }
            <Title>{t('userMasterPasswordValidation.Please write your master password')}</Title>

            <p>{t('userMasterPasswordValidation.We need your master password to decrypt your passwords')}</p>
            <ul>
                <li>{t('userMasterPasswordValidation.Your data can\'t be accessed without your master password, not even by Passager administrators')}</li>
                <li>{t('userMasterPasswordValidation.If you lose your password, you won\'t be able to access your account. And nobody would be able to recover it')}</li>
                <li>{t('userMasterPasswordValidation.We will never ask you for your master password by e-mail or other external methods. Do not share it with anyone, under any circumstances')}</li>
            </ul>
            <InputWrapper marginBottom='25px'>
                <InputLabel htmlFor="password">{t('userMasterPasswordValidation.Master password')}</InputLabel>
                <Input 
                    defaultValue={password.value}
                    id="password"
                    type="password"
                    placeholder={t('userMasterPasswordValidation.Type here your password')}
                    onChange={(e) => setPassword({value: e.target.value, error: ''})}/>
                {password.error.length > 0 && <span style={{color: 'red'}}>{password.error}</span>}
            </InputWrapper>
            <ButtonWrapper justifyContent='center'>
                <Button label={t('common.Access')} onClick={() => onLogin()}/>
            </ButtonWrapper>
            
            <AtomButtonLink onClick={logout}>{t('common.Logout')}</AtomButtonLink>
            <AtomLanguageSelector />
        </NotLogged>
    </>

}

PageUserMasterPasswordValidation.displayName = 'PageUserMasterPasswordValidation';
PageUserMasterPasswordValidation.propTypes = {
    user: PropTypes.object
}

export default withUser(PageUserMasterPasswordValidation);
