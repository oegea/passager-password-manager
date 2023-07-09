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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
import { isMobileDevice } from '../../../libs/mobile.js';
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
// Vendor
import {Html5QrcodeScanner} from 'html5-qrcode';

const PageUserPrivateKeyValidation = ({ user }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState({
        value: '',
        error: '',
    });
    const qrScanner = useRef(null);

    const [displaySpinner, setDisplaySpinner] = useState(false);

    const onLogin = useCallback(
        async (overridedPassword) => {
            if (overridedPassword) password.value = overridedPassword;

            if (displaySpinner) {
                return;
            }
            setDisplaySpinner(true);
            const decryptResult = await user.decryptPrivateKey(password.value);
            let error = '';

            if (decryptResult === false) {
                error = t(
                    'userMasterPasswordValidation.The entered password is not valid'
                );
            }

            setDisplaySpinner(false);
            setPassword({
                value: password.value,
                error,
            });
        },
        [displaySpinner, password, t, user]
    );

    const onScanSuccess = (decodedText, decodedResult) => {
        // Handle on success condition with the decoded text or result.
        console.log(`Scan result: ${decodedText}`, decodedResult);
        setPassword({ value: password.value+decodedText, error: '' });
    };

    useEffect(() => {
        qrScanner.current = new Html5QrcodeScanner(
            'reader', { fps: 10, qrbox: 250 });
        qrScanner.current.render(onScanSuccess);
    });

    useDialogConfirmation(() => null, onLogin);

    return (
        <>
            <NotLogged>
                {displaySpinner && <GlobalSpinner />}
                <Title>
                    Please provide your private key to continue
                </Title>

                <p>
                    You need to provide your private key the first time you login on a new device.
                </p>
                <p>
                    Please copy it manually, or by scanning it from the two QR codes from your access kit.
                </p>
                <div id="reader"></div>
                <InputWrapper marginBottom="25px">
                    <InputLabel htmlFor="password">
                        Private key
                    </InputLabel>
                    <Input
                        defaultValue={password.value}
                        id="password"
                        type="password"
                        placeholder={t(
                            'userMasterPasswordValidation.Type here your private key'
                        )}
                        onChange={(e) =>
                            setPassword({ value: e.target.value, error: '' })
                        }
                    />
                    {password.error.length > 0 && (
                        <span style={{ color: 'red' }}>{password.error}</span>
                    )}
                </InputWrapper>
                <ButtonWrapper justifyContent="center">
                    <Button
                        label={t('common.Access')}
                        onClick={() => onLogin()}
                    />
                </ButtonWrapper>

                {
                    !isMobileDevice() && 
                    <AtomButtonLink onClick={logout}>
                        {t('common.Logout')}
                    </AtomButtonLink>
                }
                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PageUserPrivateKeyValidation.displayName =
    'PageUserPrivateKeyValidation';
PageUserPrivateKeyValidation.propTypes = {
    user: PropTypes.object,
};

export default withUser(PageUserPrivateKeyValidation);
