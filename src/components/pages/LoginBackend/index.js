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
// Molecules
import LanguageSelector from '../../molecules/LanguageSelector/index.js';
// Templates
import NotLogged from '../../templates/NotLogged/index.js';
// Own libs
import { removeServiceUrls } from '../../../libs/backend.js';
// Hooks
import { useCheckBackendConfigAndRedirectEffect } from './useCheckBackendConfigAndRedirectEffect.js';
// Local components
import IntroduceEmailStage from './components/IntroduceEmailStage.js';
import ValidateCodeStage from './components/ValidateCodeStage.js';

const PageLoginBackend = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState({
        value: '',
        error: '',
    });
    const [stage, setStage] = useState('INTRODUCE_EMAIL');

    useCheckBackendConfigAndRedirectEffect();
    return (
        <>
            <NotLogged>
                <Title>Passager</Title>
                <p>
                    {t(
                        'loginBackend.Please introduce your e-mail address'
                    )}.
                </p>

                {
                    stage === 'INTRODUCE_EMAIL' &&
                    <IntroduceEmailStage email={email} setEmail={setEmail} t={t} onSuccess={() => setStage('VALIDATE_CODE')} />
                }

                {
                    stage === 'VALIDATE_CODE' &&
                    <ValidateCodeStage email={email} t={t} />
                }  

                <p>
                    {t('loginBackend.You are logging in your organization through the following url')}: {localStorage.getItem('documentsUrl')}
                    <AtomButtonLink onClick={removeServiceUrls}>
                        ({t('loginBackend.Click here to connect to another organization')})
                    </AtomButtonLink>
                </p>

                <LanguageSelector />
            </NotLogged>
        </>
    );
};

PageLoginBackend.displayName = 'PageLoginBackend';

export default PageLoginBackend;
