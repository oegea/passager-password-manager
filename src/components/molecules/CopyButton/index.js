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
import Icon from '../../atoms/Icon/index.js';
import Toast from '../Toast/index.js';
import useToast from '../../../hooks/useToast/index.js';
// Own libs
import { writeClipboard } from '../../../libs/clipboard.js';
const CopyIconButton = styled.button`
    align-items: center;
    appearance: none;
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    height: 42px;
    justify-content: center;
    margin-left: 8px;
    padding: 0;
    transition: background-color var(--duration-fast) ease,
        color var(--duration-fast) ease,
        transform var(--duration-fast) var(--ease-out);
    width: 42px;

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-accent);
    }

    &:active {
        transform: scale(0.92);
    }
`;

const MoleculesButtonCopy = ({ value }) => {
    const { t } = useTranslation();
    const { toasts, showToast, removeToast } = useToast();

    const copyHandler = () => {
        writeClipboard(value);
        showToast(t('common.Copied to clipboard'));
    };

    return (
        <>
            <CopyIconButton
                type="button"
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
                    kind={toast.kind}
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
