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
// Molecules
import Notice from '../../molecules/Notice/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import usePwa from '../../../hooks/usePwa/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
// Own libs
import { applyUpdate, promptInstall } from '../../../libs/pwa.js';
import {
    BiometricCancelledError,
    BiometricUnavailableError,
    getBiometricMethodName,
} from '../../../libs/biometric.js';

const INSTALL_DISMISSED_KEY = 'installDismissed';

const Stack = styled.div`
    bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: fixed;
    right: 20px;
    z-index: 500;

    @media (max-width: 768px) {
        left: 20px;
    }
`;

/**
 * Notices that do not belong to a specific page: a new version of the app
 * and the offer to enable the biometric unlock.
 */
const OrganismAppNotices = ({ user }) => {
    const { t } = useTranslation();
    const { updateAvailable, canPromptInstall, canInstallManually, isStandalone } =
        usePwa();
    const [installDismissed, setInstallDismissed] = useState(
        () => localStorage.getItem(INSTALL_DISMISSED_KEY) === '1'
    );
    const [updateDismissed, setUpdateDismissed] = useState(false);
    const [biometricError, setBiometricError] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    const isUnlocked = user !== null && user.decryptedPrivateKey === true;
    const method = getBiometricMethodName();

    const onEnableBiometric = async () => {
        if (isBusy) return;
        setIsBusy(true);
        setBiometricError('');
        try {
            await user.enableBiometric();
        } catch (e) {
            if (e instanceof BiometricCancelledError) {
                await user.dismissBiometricOffer(false);
            } else if (e instanceof BiometricUnavailableError) {
                await user.dismissBiometricOffer(true);
            } else {
                setBiometricError(
                    t('biometric.It was not possible to enable it')
                );
            }
        }
        setIsBusy(false);
    };

    const notices = [];

    if (updateAvailable && !updateDismissed) {
        notices.push(
            <Notice
                key="update"
                testId="notice-update"
                title={t('pwa.A new version of Passager is available')}
                description={t(
                    'pwa.Update now to get the latest security improvements'
                )}
                actions={[
                    {
                        label: t('pwa.Update'),
                        variant: 'primary',
                        onClick: () => applyUpdate(),
                    },
                    {
                        label: t('pwa.Later'),
                        variant: 'ghost',
                        onClick: () => setUpdateDismissed(true),
                    },
                ]}
            />
        );
    }

    if (isUnlocked && user.biometricOffer) {
        notices.push(
            <Notice
                key="biometric"
                testId="notice-biometric"
                title={t('biometric.Unlock faster next time', { method })}
                description={t('biometric.offerDescription', { method })}
                error={biometricError}
                actions={[
                    {
                        label: t('common.Enable'),
                        variant: 'primary',
                        onClick: onEnableBiometric,
                    },
                    {
                        label: t('biometric.Not now'),
                        variant: 'ghost',
                        onClick: () => user.dismissBiometricOffer(false),
                    },
                    {
                        label: t('biometric.Do not ask again'),
                        variant: 'ghost',
                        onClick: () => user.dismissBiometricOffer(true),
                    },
                ]}
            />
        );
    }

    const dismissInstall = (remember) => {
        if (remember) localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
        setInstallDismissed(true);
    };

    // Offered once the vault is open, never in the middle of signing in
    if (
        isUnlocked &&
        !isStandalone &&
        !installDismissed &&
        !user.biometricOffer &&
        (canPromptInstall || canInstallManually)
    ) {
        notices.push(
            <Notice
                key="install"
                testId="notice-install"
                title={t('pwa.Install Passager')}
                description={
                    canPromptInstall
                        ? t('pwa.installDescription')
                        : `${t('pwa.installDescription')} ${t('pwa.iosInstallInstructions')}`
                }
                actions={[
                    ...(canPromptInstall
                        ? [
                            {
                                label: t('pwa.Install'),
                                variant: 'primary',
                                onClick: async () => {
                                    await promptInstall();
                                    dismissInstall(false);
                                },
                            },
                        ]
                        : []),
                    {
                        label: t('biometric.Not now'),
                        variant: 'ghost',
                        onClick: () => dismissInstall(false),
                    },
                    {
                        label: t('biometric.Do not ask again'),
                        variant: 'ghost',
                        onClick: () => dismissInstall(true),
                    },
                ]}
            />
        );
    }

    if (notices.length === 0) return null;

    return <Stack>{notices}</Stack>;
};

OrganismAppNotices.displayName = 'OrganismAppNotices';
OrganismAppNotices.propTypes = {
    user: PropTypes.object,
};

export default withUser(OrganismAppNotices);
