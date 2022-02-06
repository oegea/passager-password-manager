// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
import { checkPassword } from '../../../libs/masterPassword.js';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import AtomButtonLink from '../../atoms/ButtonLink/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../atoms/InputLabel/index.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Context
import withUser from '../../../providers/WithUser.js';

const PageUserSignup = ({user}) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState({
        value: '',
        error: ''
    });

    const onChangeHandler = (e) => {
        const value = e.target.value;
        const passwordCheck = checkPassword(value);
        let error = '';

        if (!passwordCheck.caps) {
            error = t('common.Password must contain at least one capital letter');
        }
        if (!passwordCheck.numbers) {
            error = t('common.Password must contain at least one number');
        }
        if (!passwordCheck.length) {
            error = t('common.Password must be at least 8 characters long');
        }
        if (!passwordCheck.special) {
            error = t('common.Password must contain at least one special character');
        }
        if (!passwordCheck.small) {
            error = t('common.Password must contain at least one small letter');
        }
        
        setPassword({
            value,
            error
        });
    }

    return <>
        <NotLogged>
            <Title>Define a master password</Title>
            {step === 1 && <>
                <p>We need to define a master password for your user.</p>
                <p>This will be the only password you'll have to remember from now on, and it will maintain all your other passwords encrypted and secured.</p>
                <p>Please, choose a password and save it safely. Note that if you forget it, Passager administrators won't be able to recover your account and you'll lost all your information.</p>
                <ButtonWrapper justifyContent='center'>
                    <Button label="Continue" onClick={() => setStep(2)}/>
                </ButtonWrapper>
            </>}

            {step === 2 && <>
                <p>Tips for choosing a safe master password:</p>
                <ul>
                    <li>Use a combination of letters, numbers and symbols.</li>
                    <li>Use a password longer than 8 characters.</li>
                    <li>Avoid using the same password on other services or accounts.</li>
                </ul>
                <InputWrapper marginBottom='25px'>
                    <InputLabel htmlFor="password">{t('Master password')}</InputLabel>
                    <Input 
                        defaultValue={password.value}
                        id="password"
                        type="text"
                        placeholder={t('Type here a safe password')}
                        onChange={(e) => onChangeHandler(e, 'password')}/>
                    {password.error.length > 0 && <span style={{color: 'red'}}>{password.error}</span>}
                </InputWrapper>
                <ButtonWrapper justifyContent='center'>
                    <Button label="Go back" onClick={() => setStep(1)}/>
                    <Button label="Finish" onClick={() => setStep(2)}/>
                </ButtonWrapper>
            </>}
            <AtomButtonLink onClick={logout}>Logout</AtomButtonLink>
        </NotLogged>
    </>

}

PageUserSignup.displayName = 'PageUserSignup';
PageUserSignup.propTypes = {
    user: PropTypes.object
}

export default withUser(PageUserSignup);