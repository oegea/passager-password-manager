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
import Icon from '@mdi/react';
import useTranslation from '../../../hooks/useTranslation/index.js';
import {writeClipboard, isMobileDevice} from '../../../libs/mobile.js';
import PasswordGeneratorDialog from '../../organisms/PasswordGeneratorDialog/index.js';
import Toast from '../Toast/index.js';
import useToast from '../../../hooks/useToast/index.js';

const DropdownContainer = styled.div`
    position: relative;
    padding-left: 0.7rem;
`;

const TriggerButton = styled.div`
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 10px;
    background-color: #f7f7f7;
    color: #383838;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background: #e5e5e5;
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 140px;
`;

const MenuItem = styled.div`
    padding: 10px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;
    
    &:hover {
        background: #f5f5f5;
    }
    
    &:first-child {
        border-radius: 8px 8px 0 0;
    }
    
    &:last-child {
        border-radius: 0 0 8px 8px;
    }
    
    &:only-child {
        border-radius: 8px;
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
        
        // Show toast only on desktop
        if (!isMobileDevice()) {
            showToast(t('common.Copied to clipboard'));
        }
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
                <TriggerButton onClick={() => setIsOpen(!isOpen)}>
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