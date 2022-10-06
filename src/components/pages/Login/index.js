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
import React, {useEffect} from 'react';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Own libs
import { signInWithGoogle } from '../../../libs/firebase.js';
import { enableLocalMode } from '@useful-tools/localstorage';
import { isMobileDevice } from '../../../libs/mobile.js';
import LanguageSelector from '../../molecules/LanguageSelector/index.js';

const PageLogin = () => {
    // Avoid asking for login type when there is only one type
    useEffect(() => {
        if (isMobileDevice() && localStorage.getItem('storeMode') !== 'LOCAL')
            enableLocalMode();
    }, []);
    
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
                {!isMobileDevice() ? (
                    <ButtonWrapper justifyContent="center">
                        <Button
                            label={t('login.Log in with Google')}
                            onClick={signInWithGoogle}
                        />
                    </ButtonWrapper>
                ) : null}
                <ButtonWrapper justifyContent="center">
                    <Button
                        label={t('login.Store my passwords locally')}
                        onClick={enableLocalMode}
                    />
                </ButtonWrapper>
                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PageLogin.displayName = 'PageLogin';

export default PageLogin;
