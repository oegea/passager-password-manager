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

const PagePrivacy = () => {
    const { t } = useTranslation();
    return (
        <>
            <NotLogged>
                <Title>{t('privacy.Important privacy information')}</Title>
                <p>{t('privacy.You are going to use Passager by connecting to an external server that belongs to your organization.')}</p>
                <p>{t('privacy.This will allow you to access your passwords from any device, as well as share these passwords with other people from your organization.')}</p>
                <p>{t('privacy.We want you to understand precisely what data your organization will receive, and what aspects you should pay special attention to. Please read this notice carefully.')}</p>

                <p><strong>{t('privacy.Precautions before starting')}</strong></p>
                <p>{t('privacy.Never connect Passager to an unknown service URL or that does not belong to your organization.')}</p>
                <p>{t('privacy.Always check that the URL you are connecting to belongs to the one provided by your organization, distrust in case of doubt.')}</p>
                <p>{t('privacy.Never, under any circumstances, access Passager through a URL you do not know who is the owner.')}</p>

                <p><strong>{t('privacy.What data will be sent to your organization')}</strong></p>
                <p>{t('privacy.While you use Passager with your organization, the data you enter in Passager will be received and stored by your organization.')}</p>
                <p>{t('privacy.This includes data such as Email, folder names, and your passwords.')}</p>
                <p>{t('privacy.Your master key will NOT be stored by your organization and you should NEVER share it with ANYONE.')}</p>

                <p><strong>{t('privacy.What data your organization will not be able to read')}</strong></p>
                <p>{t('privacy.Although your organization stores all the data you enter in Passager, your usernames and passwords are encrypted with your master key so that only you can read them.')}</p>
                <p>{t('privacy.That means that although your organization will save your usernames and passwords, if they try to read them they will only see a set of illegible characters.')}</p>
                <p>{t('privacy.Only you with your master password and the people with whom you have shared a folder, will be able to read the usernames and passwords.')}</p>

                <p><strong>{t('privacy.What other privacy aspects should you know')}</strong></p>
                <p>{t('privacy.Contact your organization to clarify the legal basis of the data processing, the retention period, and other details regarding the privacy policy.')}</p>
                <p>{t('privacy.Keep in mind that depending on the applicable legislation in your jurisdiction, you may have data protection rights.')}</p>
                <p>{t('privacy.The creators of Passager do not receive any type of personal data from you when you use Passager. Please contact your organization if you have any questions about the privacy policy.')}</p>

                <ButtonWrapper justifyContent="center">
                    <Button
                        label={t('privacy.I understand and accept this privacy notice')}
                        onClick={() => {
                            localStorage.setItem('privacyAccepted', true);
                            document.location.href = '/configure-backend';
                        }}
                    />
                </ButtonWrapper>

                <AtomButtonLink onClick={logout}>
                    {t('privacy.I reject this privacy notice')}
                </AtomButtonLink>
                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PagePrivacy.displayName = 'PagePrivacy';

export default PagePrivacy;
