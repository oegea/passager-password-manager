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
import i18n from 'i18next';
import styled from 'styled-components';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import AtomButtonLink from '../../atoms/ButtonLink/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Own libs
import { signInWithGoogle } from '../../../libs/firebase.js';
import { enableLocalMode } from '../../../libs/localStorage.js';
import { isMobileDevice } from '../../../libs/mobile.js';

const LanguageSelector = styled.div`
    margin-top: 40px;
`;

const PageLogin = () => {

    const { t } = useTranslation();

    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const RANDOM_SENTENCES = [
        t('login.A safe place to store your passwords'),
    ];

    const changeLanguage = (e, lng) => {
        e.preventDefault();
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng)
    };


    return <>
        <NotLogged>
            <Title>Passager</Title>
            <p>{RANDOM_SENTENCES[randomIntFromInterval(0, RANDOM_SENTENCES.length - 1)]}</p>
            {!isMobileDevice() ? <ButtonWrapper justifyContent='center'>
                <Button label={t('login.Log in with Google')} onClick={signInWithGoogle}/>
            </ButtonWrapper> : null}
            <ButtonWrapper justifyContent='center'>
                <Button label={t('login.Store my passwords locally')} onClick={enableLocalMode}/>
            </ButtonWrapper>
            <LanguageSelector>
                {t('login.Change to')} 
                <AtomButtonLink onClick={(e)=> changeLanguage(e, 'en')}>English</AtomButtonLink>
                <AtomButtonLink onClick={(e)=> changeLanguage(e, 'es')}>Español</AtomButtonLink>
            </LanguageSelector>
        </NotLogged>
    </>

}

PageLogin.displayName = 'PageLogin';

export default PageLogin;