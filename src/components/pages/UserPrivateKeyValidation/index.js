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
import {storePrivateKey, getPrivateKeyFragment} from '../../../libs/privateKey.js';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import AtomButtonLink from '../../atoms/ButtonLink/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import TextArea from '../../atoms/TextArea/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../atoms/InputLabel/index.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';
import LanguageSelector from '../../molecules/LanguageSelector/index.js';

const PageUserPrivateKeyValidation = ({ user }) => {
    const { t } = useTranslation();
    const [privateKey, setPrivateKey] = useState({
        value: '',
        error: '',
    });

    const [inputMode, setInputMode] = useState(null);
    const [currentQRContent, setCurrentQRContent] = useState({
        value: '',
        error: '',
    });
    const [qrCodes, setQrCodes] = useState([]);

    const onLogin = () => {
        storePrivateKey(privateKey.value, user.email);
    };

    useDialogConfirmation(() => null, onLogin);

    const onQRInput = () => {

        const fragment = getPrivateKeyFragment(currentQRContent.value);

        if (fragment.ownerIdentifier !== user.email) {
            setCurrentQRContent({
                value: '',
                error: 'The provided QR code does not belong to your access kit.',
            });
            return;
        }

        if (fragment.fragmentNumber !== qrCodes.length + 1) {
            setCurrentQRContent({
                value: '',
                error: 'You have scanned the QR code number ' + fragment.fragmentNumber + ' but you should scan the QR code number ' + (qrCodes.length + 1),
            });
            return;
        }

        const newQrCodesValue = [...qrCodes, fragment.fragmentContent];
        setQrCodes(newQrCodesValue);
        setCurrentQRContent({
            value: '',
            error: '',
        });

        if (fragment.totalFragments === qrCodes.length + 1) {
            storePrivateKey(newQrCodesValue.join(''), user.email);
            return;
        }
    };

    const textInputMode = (
        <>
            <p>
                Please copy your private key from your access kit PDF. <string>Do not manipulate</string> or modify the key.
            </p>
            <InputWrapper marginBottom="25px">
                <InputLabel htmlFor="private-key">
                    Private key
                </InputLabel>
                <TextArea
                    defaultValue={privateKey.value}
                    id="private-key"
                    placeholder={t(
                        'Type here your private key'
                    )}
                    onChange={(e) =>
                        setPrivateKey({ value: e.target.value, error: '' })
                    }
                    value={privateKey.value}
                />
                {privateKey.error.length > 0 && (
                    <span style={{ color: 'red' }}>{privateKey.error}</span>
                )}
            </InputWrapper>
            <ButtonWrapper justifyContent="center">
                <Button
                    label={t('common.Access')}
                    onClick={() => onLogin()}
                />
            </ButtonWrapper>
        </>
    );

    const qrInputMode = (
        <>
            <p>
                Copy here the content of the <strong>QR code number {qrCodes.length + 1}</strong> from your access kit PDF.
            </p>
            <p>
                Please note that you need to scan QR codes by using your camera app or any other third-party app.
            </p>
            <InputWrapper marginBottom="25px">
                <InputLabel htmlFor="qr-content">
                    QR Code Content
                </InputLabel>
                <TextArea
                    defaultValue={privateKey.value}
                    id="qr-content"
                    placeholder={t(
                        'Type here the content of the QR number '+ (qrCodes.length + 1)
                    )}
                    onChange={(e) =>
                        setCurrentQRContent({ value: e.target.value, error: '' })
                    }
                    value={currentQRContent.value}
                />
                {currentQRContent.error.length > 0 && (
                    <span style={{ color: 'red' }}>{currentQRContent.error}</span>
                )}
            </InputWrapper>
            <ButtonWrapper justifyContent="center">
                <Button
                    label={t('common.Access')}
                    onClick={() => onQRInput()}
                />
            </ButtonWrapper>
        </>
    );

    const inputSelector = (
        <>
            <p>
                You need to provide your private key the first time you login on a new device.
            </p>
            <p>
                Please select how do you want to provide your private key:
            </p>
            <ButtonWrapper justifyContent="center">
                <Button
                    label={t('Using QR codes')}
                    onClick={() => setInputMode('QR')}
                />
                <Button
                    label={t('Copying and pasting your entire private key')}
                    onClick={() => setInputMode('TEXT')}
                />
            </ButtonWrapper>
        </>
    );

    return (
        <>
            <NotLogged>
                <Title>
                    Please provide your private key to continue
                </Title>
                
                {
                    inputMode === null ? (inputSelector) : null
                }
                {
                    inputMode === 'TEXT' ? textInputMode : null
                }
                {
                    inputMode === 'QR' ? qrInputMode : null
                }

                <AtomButtonLink onClick={logout}>
                    {t('common.Logout')}
                </AtomButtonLink>
            
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
