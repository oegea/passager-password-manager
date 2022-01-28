// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import AtomButtonLink from '../../atoms/ButtonLink/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';

// Templates
import NotLogged from '../../templates/NotLogged/index.js';

const LanguageSelector = styled.div`
    margin-top: 40px;
`;

const PageLogin = ({onGoogleLogin}) => {

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
    };


    return <>
        <NotLogged>
            <Title>Passager</Title>
            <p>{RANDOM_SENTENCES[randomIntFromInterval(0, RANDOM_SENTENCES.length - 1)]}</p>
            <ButtonWrapper justifyContent='center'>
                <Button label={t('login.Log in with Google')} onClick={onGoogleLogin}/>
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
PageLogin.propTypes = {
    onGoogleLogin: PropTypes.func
}

export default PageLogin;