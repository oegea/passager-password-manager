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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import useTranslation from '../../../hooks/useTranslation/index.js';
import Dialog from '../../atoms/Dialog/Dialog.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../atoms/InputLabel/index.js';
import Title from '../../atoms/Title/index.js';
import Description from '../../atoms/Description/index.js';

const OptionRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
`;

const Checkbox = styled.input`
    margin-right: 8px;
`;

const SliderContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
`;

const Slider = styled.input`
    flex: 1;
`;

const LengthDisplay = styled.span`
    font-weight: 600;
    min-width: 30px;
    text-align: center;
`;

const PasswordContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    min-width: 500px;
    
    @media (max-width: 768px) {
        min-width: 300px;
    }
`;

const PasswordPreview = styled.div`
    flex: 1;
    padding: 12px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    word-break: break-all;
    min-height: 20px;
    overflow-wrap: break-word;
`;

const RefreshButton = styled.div`
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    border: 1px solid #ddd;
    
    &:hover {
        background: #e5e5e5;
    }
`;

const WarningMessage = styled.div`
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 16px;
    color: #856404;
    font-size: 14px;
`;

const generatePassword = (options) => {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') return '';
    
    let password = '';
    const crypto = window.crypto || window.msCrypto;
    
    for (let i = 0; i < length; i++) {
        let randomIndex;
        if (crypto && crypto.getRandomValues) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            randomIndex = randomArray[0] % charset.length;
        } else {
            // Fallback for testing environment
            randomIndex = Math.floor(Math.random() * charset.length);
        }
        password += charset[randomIndex];
    }
    
    return password;
};

const PasswordGeneratorDialog = ({ onGenerate, onClose, currentPassword = '' }) => {
    const { t } = useTranslation();
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [options, setOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
    });
    
    const hasCurrentPassword = currentPassword && currentPassword.trim() !== '';

    // Generate initial password when dialog opens
    useEffect(() => {
        const password = generatePassword(options);
        setGeneratedPassword(password);
    }, []);

    const handleOptionChange = (optionName, value) => {
        const newOptions = {
            ...options,
            [optionName]: value
        };
        setOptions(newOptions);
        
        // Auto-generate password when options change
        const password = generatePassword(newOptions);
        setGeneratedPassword(password);
    };

    const handleUsePassword = () => {
        if (hasCurrentPassword && !showConfirmation) {
            setShowConfirmation(true);
        } else {
            onGenerate(generatedPassword);
        }
    };

    const handleCancel = () => {
        if (showConfirmation) {
            setShowConfirmation(false);
        } else {
            onClose();
        }
    };

    const handleRegeneratePassword = () => {
        const password = generatePassword(options);
        setGeneratedPassword(password);
    };

    return (
        <>
            <Dialog onClose={onClose}>
                <Title marginBottom="25px">
                    {t('passwordGenerator.Password Generator')}
                </Title>

                <InputWrapper marginBottom="20px">
                    <SliderContainer>
                        <InputLabel>{t('passwordGenerator.Length')}</InputLabel>
                        <Slider
                            type="range"
                            min="4"
                            max="50"
                            value={options.length}
                            onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
                        />
                        <LengthDisplay>{options.length}</LengthDisplay>
                    </SliderContainer>
                </InputWrapper>

                <InputWrapper marginBottom="20px">
                    <OptionRow>
                        <Checkbox
                            type="checkbox"
                            checked={options.includeUppercase}
                            onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
                        />
                        <InputLabel>{t('passwordGenerator.Include uppercase letters')}</InputLabel>
                    </OptionRow>

                    <OptionRow>
                        <Checkbox
                            type="checkbox"
                            checked={options.includeLowercase}
                            onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
                        />
                        <InputLabel>{t('passwordGenerator.Include lowercase letters')}</InputLabel>
                    </OptionRow>

                    <OptionRow>
                        <Checkbox
                            type="checkbox"
                            checked={options.includeNumbers}
                            onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
                        />
                        <InputLabel>{t('passwordGenerator.Include numbers')}</InputLabel>
                    </OptionRow>

                    <OptionRow>
                        <Checkbox
                            type="checkbox"
                            checked={options.includeSymbols}
                            onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
                        />
                        <InputLabel>{t('passwordGenerator.Include symbols')}</InputLabel>
                    </OptionRow>
                </InputWrapper>

                {generatedPassword && (
                    <InputWrapper marginBottom="20px">
                        <InputLabel>{t('passwordGenerator.Generated Password')}</InputLabel>
                        <PasswordContainer>
                            <PasswordPreview>{generatedPassword}</PasswordPreview>
                            <RefreshButton 
                                onClick={handleRegeneratePassword}
                                title={t('passwordGenerator.Regenerate')}
                            >
                                <Icon path={mdiRefresh} size={0.8} />
                            </RefreshButton>
                        </PasswordContainer>
                    </InputWrapper>
                )}

                {showConfirmation && (
                    <WarningMessage>
                        {t('passwordGenerator.Replace password confirmation')}
                    </WarningMessage>
                )}

                <ButtonWrapper>
                    <Button
                        label={showConfirmation ? t('common.Go back') : t('common.Cancel')}
                        onClick={handleCancel}
                        color="black"
                        backgroundColor="white"
                    />
                    <Button
                        label={showConfirmation ? t('common.Continue') : t('passwordGenerator.Use this password')}
                        onClick={handleUsePassword}
                        color="black"
                        backgroundColor="white"
                    />
                </ButtonWrapper>
            </Dialog>
        </>
    );
};

PasswordGeneratorDialog.displayName = 'PasswordGeneratorDialog';
PasswordGeneratorDialog.propTypes = {
    onGenerate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    currentPassword: PropTypes.string,
};

export default PasswordGeneratorDialog;