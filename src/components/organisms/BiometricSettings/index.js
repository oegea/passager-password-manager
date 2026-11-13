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
import styled from 'styled-components';
import {
    mdiCellphoneArrowDown,
    mdiCheckCircle,
    mdiFingerprint,
} from '@mdi/js';
// Atoms
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Dialog from '../../atoms/Dialog/Dialog.js';
import FieldError from '../../atoms/FieldError/index.js';
import Icon from '../../atoms/Icon/index.js';
import Input from '../../atoms/Input/index.js';
import InputLabel from '../../atoms/InputLabel/index.js';
import Title from '../../atoms/Title/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import usePwa from '../../../hooks/usePwa/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
// Own libs
import {
    BiometricCancelledError,
    BiometricUnavailableError,
    getBiometricMethodName,
} from '../../../libs/biometric.js';
import { promptInstall } from '../../../libs/pwa.js';

const Panel = styled.div`
    align-items: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    display: flex;
    gap: 16px;
    margin: 16px 0;
    padding: 18px 20px;

    @media (max-width: 768px) {
        align-items: flex-start;
        flex-direction: column;
    }
`;

const IconCircle = styled.div`
    align-items: center;
    background: var(--color-accent-soft);
    border-radius: 14px;
    color: var(--color-accent);
    display: flex;
    flex-shrink: 0;
    height: 46px;
    justify-content: center;
    width: 46px;
`;

const Text = styled.div`
    flex: 1;
    min-width: 0;
`;

const Heading = styled.div`
    align-items: center;
    color: var(--color-text);
    display: flex;
    flex-wrap: wrap;
    font-weight: 700;
    gap: 8px;
`;

const Badge = styled.span`
    align-items: center;
    background: var(--color-success-soft);
    border-radius: var(--radius-full);
    color: var(--color-success);
    display: inline-flex;
    font-size: 12px;
    font-weight: 600;
    gap: 4px;
    padding: 2px 8px 2px 4px;
`;

const Description = styled.p`
    color: var(--color-text-muted);
    font-size: 14px;
    margin: 4px 0 0;
`;

const DialogText = styled.p`
    color: var(--color-text-muted);
    margin: 0 0 18px;
    max-width: 420px;
`;

/**
 * Device settings shown in the profile: biometric unlock and installation.
 */
const OrganismBiometricSettings = ({ user }) => {
    const { t } = useTranslation();
    const { canPromptInstall, canInstallManually, isStandalone } = usePwa();
    const [showDialog, setShowDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const method = getBiometricMethodName();

    const closeDialog = () => {
        setShowDialog(false);
        setPassword('');
        setError('');
    };

    const onEnable = async () => {
        if (isBusy) return;
        if (password.length === 0) {
            setError(t('biometric.Type your master password to enable it'));
            return;
        }
        setIsBusy(true);
        setError('');
        try {
            await user.enableBiometric({ password });
            closeDialog();
        } catch (e) {
            let message = t('biometric.The master password is not valid');
            if (e instanceof BiometricCancelledError)
                message = t('biometric.The request was cancelled');
            else if (e instanceof BiometricUnavailableError)
                message = t('biometric.This device does not support it');
            setError(message);
        }
        setIsBusy(false);
    };

    const isBiometricAvailable = user.biometricAvailability !== 'no';

    return (
        <>
            {(isBiometricAvailable || user.biometricEnrolled) && (
                <Panel data-testid="biometric-settings">
                    <IconCircle>
                        <Icon path={mdiFingerprint} size={1} />
                    </IconCircle>
                    <Text>
                        <Heading>
                            {t('biometric.Biometric unlock', { method })}
                            {user.biometricEnrolled && (
                                <Badge data-testid="biometric-enabled">
                                    <Icon path={mdiCheckCircle} size={0.6} />
                                    {t('biometric.On')}
                                </Badge>
                            )}
                        </Heading>
                        <Description>
                            {user.biometricEnrolled
                                ? t('biometric.enabledDescription', { method })
                                : t('biometric.disabledDescription', {
                                    method,
                                })}
                        </Description>
                    </Text>
                    {user.biometricEnrolled ? (
                        <Button
                            label={t('biometric.Disable')}
                            onClick={() => user.disableBiometric()}
                        />
                    ) : (
                        <Button
                            label={t('common.Enable')}
                            variant="primary"
                            onClick={() => setShowDialog(true)}
                        />
                    )}
                </Panel>
            )}

            {!isStandalone && (canPromptInstall || canInstallManually) && (
                <Panel data-testid="install-settings">
                    <IconCircle>
                        <Icon path={mdiCellphoneArrowDown} size={1} />
                    </IconCircle>
                    <Text>
                        <Heading>{t('pwa.Install Passager')}</Heading>
                        <Description>
                            {t('pwa.installDescription')}
                            {canInstallManually && !canPromptInstall && (
                                <> {t('pwa.iosInstallInstructions')}</>
                            )}
                        </Description>
                    </Text>
                    {canPromptInstall && (
                        <Button
                            label={t('pwa.Install')}
                            variant="primary"
                            onClick={() => promptInstall()}
                        />
                    )}
                </Panel>
            )}

            {showDialog && (
                <Dialog onClose={closeDialog}>
                    <Title marginBottom="8px">
                        {t('biometric.Biometric unlock', { method })}
                    </Title>
                    <DialogText>
                        {t('biometric.Confirm with your master password')}
                    </DialogText>
                    <InputLabel htmlFor="biometric-password">
                        {t('userMasterPasswordValidation.Master password')}
                    </InputLabel>
                    <Input
                        id="biometric-password"
                        type="password"
                        autoComplete="current-password"
                        autoFocus
                        value={password}
                        placeholder={t(
                            'userMasterPasswordValidation.Type here your password'
                        )}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onEnable();
                            if (e.key === 'Escape') closeDialog();
                        }}
                    />
                    <FieldError>{error}</FieldError>
                    <ButtonWrapper>
                        <Button
                            label={t('common.Cancel')}
                            variant="ghost"
                            onClick={closeDialog}
                        />
                        <Button
                            label={t('common.Enable')}
                            variant="primary"
                            disabled={isBusy}
                            testId="biometric-confirm"
                            onClick={onEnable}
                        />
                    </ButtonWrapper>
                </Dialog>
            )}
        </>
    );
};

OrganismBiometricSettings.displayName = 'OrganismBiometricSettings';
OrganismBiometricSettings.propTypes = {
    user: PropTypes.object,
};

export default withUser(OrganismBiometricSettings);
