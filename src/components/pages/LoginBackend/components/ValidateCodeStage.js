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
import PropTypes from 'prop-types';
import {useState} from 'react';
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
import { finishLoginProcess } from '../../../../libs/backend.js';

const ValidateCodeStage = ({
    email,
    t
}) => {

    const [displaySpinner, setDisplaySpinner] = useState(false);
    const [code, setCode] = useState({
        value: '',
        error: ''
    });

    const onAccess = async () => {
        setDisplaySpinner(true);
        const result = await finishLoginProcess(
            localStorage.getItem('authenticationUrl'), 
            email.value,
            code.value
        );
        setDisplaySpinner(false);
        if (result === false) {
            setCode({
                value: email.value,
                error: 'loginBackend.The entered code is not valid',
            });
            return;
        }
    };

    useDialogConfirmation(() => null, onAccess);
    return (
        <>
            {displaySpinner && <GlobalSpinner />}
            <p>
                {t(
                    'loginBackend.A validation code has been sent to your e-mail address. Please, type it below to continue.'
                )}.
            </p>
            <InputWrapper marginBottom="25px">
                <InputLabel htmlFor="code">
                    {t('loginBackend.Validation code')}
                </InputLabel>
                <Input
                    defaultValue={code.value}
                    id="code"
                    type="number"
                    placeholder={t(
                        'loginBackend.Type here the validation code'
                    )}
                    onChange={(e) =>
                        setCode({ value: e.target.value, error: '' })
                    }
                />
                {code.error.length > 0 && (
                    <span style={{ color: 'red' }}>{t(code.error)}</span>
                )}
            </InputWrapper>

            <ButtonWrapper justifyContent="center">
                <Button
                    label={t('common.Access')}
                    onClick={onAccess}
                />
            </ButtonWrapper>
        </>
    );

};

ValidateCodeStage.displayName = 'ValidateCodeStage';
ValidateCodeStage.propTypes = {
    email: PropTypes.shape({
        value: PropTypes.string.isRequired,
        error: PropTypes.string.isRequired,
    }).isRequired,
    t: PropTypes.func.isRequired
};

export default ValidateCodeStage;