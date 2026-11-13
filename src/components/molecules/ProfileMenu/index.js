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
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { mdiAccount, mdiChevronDown, mdiCogOutline } from '@mdi/js';
// Atoms
import Icon from '../../atoms/Icon/index.js';
// Organisms
import ProfileSwitcher from '../../organisms/ProfileSwitcher/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const Wrapper = styled.div`
    position: relative;
`;

const Trigger = styled.button`
    align-items: center;
    appearance: none;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    gap: 8px;
    height: 38px;
    padding: 0 10px 0 12px;
    transition: background-color var(--duration-fast) ease,
        color var(--duration-fast) ease;
    white-space: nowrap;

    &:hover,
    &[aria-expanded='true'] {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    @media (max-width: 768px) {
        padding: 0 9px;
    }
`;

const Label = styled.span`
    @media (max-width: 768px) {
        display: none;
    }
`;

const Chevron = styled.span`
    display: flex;
    transition: transform var(--duration-base) var(--ease-out);

    [aria-expanded='true'] & {
        transform: rotate(180deg);
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

const Menu = styled.div`
    animation: passager-fade-up var(--duration-fast) var(--ease-out);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 10px;
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    width: min(340px, calc(100vw - 24px));
    z-index: 300;
`;

const SectionLabel = styled.div`
    color: var(--color-text-faint);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 6px 10px 8px;
    text-transform: uppercase;
`;

const MenuItem = styled.button`
    align-items: center;
    appearance: none;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    gap: 10px;
    margin-bottom: 8px;
    padding: 10px;
    text-align: left;
    width: 100%;

    &:hover {
        background: var(--color-surface-hover);
    }
`;

/**
 * Menu of the app bar with the settings of the account in use and the other
 * accounts kept in this browser.
 */
const MoleculeProfileMenu = ({ onOpenSettings }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onPointerDown = (event) => {
            // Dialogs opened from the menu live outside of it
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                !event.target.closest('[data-isdialogbackground]')
            )
                setIsOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    return (
        <Wrapper ref={wrapperRef}>
            <Trigger
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                title={t('common.My profile')}
                data-testid="profile-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Icon path={mdiAccount} size={0.8} />
                <Label>{t('common.My profile')}</Label>
                <Chevron>
                    <Icon path={mdiChevronDown} size={0.7} />
                </Chevron>
            </Trigger>

            {isOpen && (
                <Menu role="menu" data-testid="profile-menu">
                    <MenuItem
                        type="button"
                        data-testid="profile-settings"
                        onClick={() => {
                            setIsOpen(false);
                            onOpenSettings();
                        }}
                    >
                        <Icon path={mdiCogOutline} size={0.8} />
                        {t('profiles.Account settings')}
                    </MenuItem>
                    <SectionLabel>{t('profiles.Accounts')}</SectionLabel>
                    <ProfileSwitcher onSelectActive={() => setIsOpen(false)} />
                </Menu>
            )}
        </Wrapper>
    );
};

MoleculeProfileMenu.displayName = 'MoleculeProfileMenu';
MoleculeProfileMenu.propTypes = {
    onOpenSettings: PropTypes.func.isRequired,
};

export default MoleculeProfileMenu;
