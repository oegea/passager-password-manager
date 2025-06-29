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
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import Toast from '../Toast/index.js';
import useToast from '../../../hooks/useToast/index.js';
// Own libs
import {writeClipboard, isMobileDevice} from '../../../libs/mobile.js';
const CopyIconButton = styled.div`
    margin-left: 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #f5f5f5;
    }
    
    &:active {
        background-color: #e0e0e0;
    }
`;

const MoleculesButtonCopy = ({ value }) => {
    const { t } = useTranslation();
    const { toasts, showToast, removeToast } = useToast();

    const copyHandler = () => {
        writeClipboard(value);
        
        // Show toast only on desktop
        if (!isMobileDevice()) {
            showToast(t('common.Copied to clipboard'));
        }
    };

    return (
        <>
            <CopyIconButton 
                data-testid="button-copy-element"
                onClick={copyHandler}
                title={t('common.Copy')}
            >
                <Icon path={mdiContentCopy} size={0.8} />
            </CopyIconButton>
            
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
};

MoleculesButtonCopy.displayName = 'MoleculesButtonCopy';
MoleculesButtonCopy.propTypes = {
    value: PropTypes.string,
};

export default MoleculesButtonCopy;
