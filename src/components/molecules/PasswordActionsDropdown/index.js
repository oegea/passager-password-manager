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

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { mdiDotsVertical, mdiContentCopy, mdiCog } from '@mdi/js';
import Icon from '../../atoms/Icon/index.js';
import useTranslation from '../../../hooks/useTranslation/index.js';
import { writeClipboard } from '../../../libs/clipboard.js';
import PasswordGeneratorDialog from '../../organisms/PasswordGeneratorDialog/index.js';
import Toast from '../Toast/index.js';
import useToast from '../../../hooks/useToast/index.js';

const DropdownContainer = styled.div`
    margin-left: 8px;
    position: relative;
`;

const TriggerButton = styled.button`
    align-items: center;
    appearance: none;
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    height: 42px;
    justify-content: center;
    padding: 0;
    transition: background-color var(--duration-fast) ease,
        color var(--duration-fast) ease;
    width: 42px;

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-accent);
    }
`;

const DropdownMenu = styled.div`
    animation: passager-fade-up var(--duration-fast) var(--ease-out);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 170px;
    padding: 6px;
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 1000;
`;

const MenuItem = styled.div`
    align-items: center;
    border-radius: var(--radius-sm);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    font-size: 14px;
    font-weight: 500;
    gap: 10px;
    padding: 9px 10px;

    &:hover {
        background: var(--color-surface-hover);
    }
`;

const PasswordActionsDropdown = ({ value, onGenerate, currentPassword = '' }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const { toasts, showToast, removeToast } = useToast();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCopy = () => {
        writeClipboard(value);
        setIsOpen(false);
        showToast(t('common.Copied to clipboard'));
    };

    const handleGenerate = () => {
        setShowGenerator(true);
        setIsOpen(false);
    };

    const handlePasswordGenerated = (password) => {
        onGenerate(password);
        setShowGenerator(false);
    };

    return (
        <>
            <DropdownContainer ref={dropdownRef} data-testid="password-actions-dropdown">
                <TriggerButton type="button" onClick={() => setIsOpen(!isOpen)}>
                    <Icon path={mdiDotsVertical} size={0.8} />
                </TriggerButton>
                
                {isOpen && (
                    <DropdownMenu>
                        <MenuItem onClick={handleCopy}>
                            <Icon path={mdiContentCopy} size={0.7} />
                            {t('common.Copy')}
                        </MenuItem>
                        <MenuItem onClick={handleGenerate}>
                            <Icon path={mdiCog} size={0.7} />
                            {t('passwordGenerator.Generate')}
                        </MenuItem>
                    </DropdownMenu>
                )}
            </DropdownContainer>
            
            {showGenerator && ReactDOM.createPortal(
                <PasswordGeneratorDialog
                    onGenerate={handlePasswordGenerated}
                    onClose={() => setShowGenerator(false)}
                    currentPassword={currentPassword}
                />,
                document.body
            )}
            
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

PasswordActionsDropdown.displayName = 'PasswordActionsDropdown';
PasswordActionsDropdown.propTypes = {
    value: PropTypes.string,
    onGenerate: PropTypes.func.isRequired,
    currentPassword: PropTypes.string,
};

export default PasswordActionsDropdown;