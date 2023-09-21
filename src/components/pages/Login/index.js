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
import React from 'react';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Own libs
import { enableLocalMode } from '@useful-tools/localstorage';
import { enableBackendMode } from '../../../libs/backend.js';
import LanguageSelector from '../../molecules/LanguageSelector/index.js';

const PageLogin = () => {
    
    const { t } = useTranslation();

    function randomIntFromInterval(min, max) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const RANDOM_SENTENCES = [t('login.A safe place to store your passwords')];
    return (
        <>
            <NotLogged>
                <Title>Passager</Title>
                <p>
                    {
                        RANDOM_SENTENCES[
                            randomIntFromInterval(
                                0,
                                RANDOM_SENTENCES.length - 1
                            )
                        ]
                    }
                </p>

                <ButtonWrapper justifyContent="center">
                    <Button
                        label={t('login.Use Passager locally for personal purposes')}
                        onClick={enableLocalMode}
                    />
                </ButtonWrapper>

                <ButtonWrapper justifyContent="center">
                    <Button
                        label={t('login.Use Passager in my organization')}
                        onClick={enableBackendMode}
                    />
                </ButtonWrapper>
                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PageLogin.displayName = 'PageLogin';

export default PageLogin;
