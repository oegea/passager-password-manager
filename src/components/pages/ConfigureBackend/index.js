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
import React, {useState} from 'react';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Atoms
import AtomButtonLink from '../../atoms/ButtonLink/index.js';
import Title from '../../atoms/Title/index.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../atoms/InputLabel/index.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
// Molecules
import LanguageSelector from '../../molecules/LanguageSelector/index.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
import {getServiceUrls, setServiceUrls} from '../../../libs/backend.js';
// Hooks
import { useCheckBackendConfigAndRedirectEffect } from './useCheckBackendConfigAndRedirectEffect.js';

const PageConfigureBackend = () => {
    const { t } = useTranslation();
    const [serviceUrl, setServiceUrl] = useState({
        value: '',
        error: '',
    });
    useCheckBackendConfigAndRedirectEffect();
    return (
        <>
            <NotLogged>
                <Title>Passager</Title>
                <p>
                    {t(
                        'configureBackend.Please introduce your organization\'s URL'
                    )}
                </p>

                <InputWrapper marginBottom="25px">
                    <InputLabel htmlFor="url">
                        {t('configureBackend.Service URL')}
                    </InputLabel>
                    <Input
                        defaultValue={serviceUrl.value}
                        id="url"
                        type="text"
                        placeholder={t(
                            'configureBackend.Type here the URL provided by your organization'
                        )}
                        onChange={(e) =>
                            setServiceUrl({ value: e.target.value, error: '' })
                        }
                    />
                    {serviceUrl.error.length > 0 && (
                        <span style={{ color: 'red' }}>{t(serviceUrl.error)}</span>
                    )}
                </InputWrapper>
                <ButtonWrapper justifyContent="center">
                    <Button
                        label={t('common.Continue')}
                        onClick={async () => {
                            const retrievedServiceUrls = await getServiceUrls(serviceUrl.value);
                            if (retrievedServiceUrls === null) {
                                setServiceUrl({
                                    ...serviceUrl,
                                    error: 'configureBackend.The URL introduced is not valid',
                                });
                                return;
                            }

                            setServiceUrls(retrievedServiceUrls);
                        }}
                    />
                </ButtonWrapper>

                <AtomButtonLink onClick={logout}>
                    {t('common.Logout')}
                </AtomButtonLink>
                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PageConfigureBackend.displayName = 'PageConfigureBackend';

export default PageConfigureBackend;