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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
import {
    checkPassword,
    setUserMasterPassword,
} from '../../../libs/masterPassword.js';
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
import LanguageSelector from '../../molecules/LanguageSelector/index.js';

const PageUserSignup = ({ user }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState({
        value: '',
        error: '',
    });

    const [passwordConfirm, setPasswordConfirm] = useState({
        value: '',
        error: '',
    });

    const [displaySpinner, setDisplaySpinner] = useState(false);

    const onPasswordChange = (value) => {
        const passwordCheck = checkPassword(value);
        let error = '';

        if (!passwordCheck.caps) {
            error = t(
                'userSignup.Password must contain at least one capital letter'
            );
        }
        if (!passwordCheck.numbers) {
            error = t('userSignup.Password must contain at least one number');
        }
        if (!passwordCheck.length) {
            error = t('userSignup.Password must be at least 8 characters long');
        }
        if (!passwordCheck.special) {
            error = t(
                'userSignup.Password must contain at least one special character'
            );
        }
        if (!passwordCheck.small) {
            error = t(
                'userSignup.Password must contain at least one small letter'
            );
        }

        setPassword({
            value,
            error,
        });

        const { passwordConfirmError } = onPasswordConfirmChange(
            value,
            passwordConfirm.value
        );

        return { passwordError: error, passwordConfirmError };
    };

    const onPasswordConfirmChange = (password, value) => {
        let error = '';

        if (value !== password) {
            error = t('userSignup.Passwords must match');
        }

        setPasswordConfirm({
            value,
            error,
        });

        return { passwordConfirmError: error };
    };

    const onFinish = () => {
        if (displaySpinner) {
            return;
        }

        const { passwordError, passwordConfirmError } = onPasswordChange(
            password.value
        );

        if (passwordError.length > 0 || passwordConfirmError.length > 0) return;

        setDisplaySpinner(true);
        setUserMasterPassword(
            user,
            password.value,
            user.reloadAuthDetails,
            user.decryptPrivateKey
        );
    };

    useDialogConfirmation(
        () => setStep(1),
        () => {
            if (step === 2) {
                onFinish();
            } else {
                setStep(2);
            }
        }
    );

    return (
        <>
            <NotLogged>
                {displaySpinner && <GlobalSpinner />}
                <Title>{t('userSignup.Define a master password')}</Title>
                {step === 1 && (
                    <>
                        <p>
                            {t(
                                'userSignup.We need to define a master password for your user'
                            )}
                        </p>
                        <p>
                            {t(
                                'userSignup.This will be the only password you\'ll have to remember from now on, and it will maintain all your other passwords encrypted and secured'
                            )}
                        </p>
                        <p>
                            {t(
                                'userSignup.Please, choose a password and save it safely. Note that if you forget it, Passager administrators won\'t be able to recover your account and you\'ll lose all your information'
                            )}
                        </p>
                        <ButtonWrapper justifyContent="center">
                            <Button
                                label={t('common.Continue')}
                                onClick={() => setStep(2)}
                            />
                        </ButtonWrapper>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p>
                            {t(
                                'userSignup.Tips for choosing a safe master password'
                            )}
                        </p>
                        <ul>
                            <li>
                                {t(
                                    'userSignup.Use a password longer than 8 characters'
                                )}
                            </li>
                            <li>
                                {t(
                                    'userSignup.Use a password that contains at least one capital letter, one number and one special character'
                                )}
                            </li>
                            <li>
                                {t(
                                    'userSignup.Avoid using the same password on other services or accounts'
                                )}
                            </li>
                        </ul>
                        <InputWrapper marginBottom="25px">
                            <InputLabel htmlFor="password">
                                {t('userSignup.Master password')}
                            </InputLabel>
                            <Input
                                defaultValue={password.value}
                                id="password"
                                type="password"
                                placeholder={t(
                                    'userSignup.Type here a safe password'
                                )}
                                onChange={(e) =>
                                    onPasswordChange(e.target.value)
                                }
                            />
                            {password.error.length > 0 && (
                                <span style={{ color: 'red' }}>
                                    {password.error}
                                </span>
                            )}
                        </InputWrapper>
                        <InputWrapper marginBottom="25px">
                            <InputLabel htmlFor="password-repeat">
                                {t('userSignup.Repeat your master password')}
                            </InputLabel>
                            <Input
                                defaultValue={passwordConfirm.value}
                                id="password-repeat"
                                type="password"
                                placeholder={t(
                                    'userSignup.Repeat here your password'
                                )}
                                onChange={(e) =>
                                    onPasswordConfirmChange(
                                        password.value,
                                        e.target.value
                                    )
                                }
                            />
                            {passwordConfirm.error.length > 0 && (
                                <span style={{ color: 'red' }}>
                                    {passwordConfirm.error}
                                </span>
                            )}
                        </InputWrapper>
                        <ButtonWrapper justifyContent="center">
                            <Button
                                label={t('common.Go back')}
                                onClick={() => setStep(1)}
                            />
                            <Button
                                label={t('common.Finish')}
                                onClick={() => onFinish()}
                            />
                        </ButtonWrapper>
                    </>
                )}
                <AtomButtonLink onClick={logout}>
                    {t('common.Logout')}
                </AtomButtonLink>
                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PageUserSignup.displayName = 'PageUserSignup';
PageUserSignup.propTypes = {
    user: PropTypes.object,
};

export default withUser(PageUserSignup);
