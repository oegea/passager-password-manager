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
import { useState } from 'react';
import PropTypes from 'prop-types';
// Atoms
import Input from '../../../atoms/Input/index.js';
import InputWrapper from '../../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../../atoms/InputLabel/index.js';
import Button from '../../../atoms/Button/index.js';
import ButtonWrapper from '../../../atoms/Dialog/DialogButtonWrapper.js';
// Molecules
import GlobalSpinner from '../../../molecules/GlobalSpinner/index.js';
// Hooks
import useDialogConfirmation from '../../../../hooks/useDialogConfirmation/index.js';
// Own libs
import { startLoginProcess } from '../../../../libs/backend.js';

const IntroduceEmailStage = ({
    email,
    setEmail,
    t,
    onSuccess
}) => {

    const [displaySpinner, setDisplaySpinner] = useState(false);

    const submitEmail = async () => {
        setDisplaySpinner(true);
        const result = await startLoginProcess(
            localStorage.getItem('authenticationUrl'), 
            email.value
        );
        setDisplaySpinner(false);
        if (result === false) {
            setEmail({
                value: email.value,
                error: 'loginBackend.The entered e-mail is not valid',
            });
            return;
        }

        onSuccess();
    };

    useDialogConfirmation(() => null, submitEmail);
    return (
        <>
            {displaySpinner && <GlobalSpinner />}
            <InputWrapper marginBottom="25px">
                <InputLabel htmlFor="email">
                    {t('loginBackend.E-mail address')}
                </InputLabel>
                <Input
                    defaultValue={email.value}
                    id="email"
                    type="text"
                    placeholder={t(
                        'loginBackend.Type here your e-mail address'
                    )}
                    onChange={(e) =>
                        setEmail({ value: e.target.value, error: '' })
                    }
                />
                {email.error.length > 0 && (
                    <span style={{ color: 'red' }}>{t(email.error)}</span>
                )}
            </InputWrapper>

            <ButtonWrapper justifyContent="center">
                <Button
                    label={t('common.Continue')}
                    onClick={submitEmail}
                />
            </ButtonWrapper>
        </>
    );

};

IntroduceEmailStage.displayName = 'IntroduceEmailStage';
IntroduceEmailStage.propTypes = {
    email: PropTypes.shape({
        value: PropTypes.string.isRequired,
        error: PropTypes.string.isRequired,
    }).isRequired,
    setEmail: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};

export default IntroduceEmailStage;