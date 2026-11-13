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
import styled from 'styled-components';
import { mdiAccount, mdiLogout } from '@mdi/js';
// Atoms
import Toolbar from '../../atoms/Toolbar/index.js';
import ToolbarGroup from '../../atoms/ToolbarGroup/index.js';
// import ToolbarInput from '../../atoms/ToolbarInput/index.js';
import ThemeToggle from '../../atoms/ThemeToggle/index.js';
import AtomToolbarButton from '../../atoms/ToolbarButton/index';
import AppBarMenuIcon from '../../atoms/AppBarMenuIcon/index.js';
// Molecules
import SearchBar from '../../molecules/SearchBar/index.js';
// Organisms
import DialogFolderList from '../DialogFolderList/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import { useNavigate } from 'react-router-dom';

const Brand = styled.button`
    align-items: center;
    appearance: none;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 18px;
    font-weight: 700;
    gap: 10px;
    letter-spacing: -0.02em;
    padding: 6px 8px;
    transition: transform var(--duration-fast) var(--ease-out);

    &:active {
        transform: scale(0.97);
    }

    & img {
        height: 28px;
        width: 28px;
    }
`;

const HideOnSearchFocus = styled.div`
    @media (max-width: 768px) {
        transition: opacity 0.3s ease, visibility 0.3s ease;
        ${props => props.$isSearchFocused && `
            opacity: 0;
            visibility: hidden;
        `}
    }
`;

const OrganismAppBar = ({ signOut, marginBottom }) => {
    const [showFolders, setShowFolders] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            <Toolbar marginBottom={marginBottom}>
                <HideOnSearchFocus $isSearchFocused={isSearchFocused}>
                    <ToolbarGroup>
                        <AppBarMenuIcon
                            onClick={() => setShowFolders(!showFolders)}
                        />
                        <Brand type="button" onClick={() => navigate('/')}>
                            <img src="/logo192.png" alt="" />
                            Passager
                        </Brand>
                    </ToolbarGroup>
                </HideOnSearchFocus>
                <ToolbarGroup>
                    <SearchBar onFocusChange={setIsSearchFocused} />
                </ToolbarGroup>
                <HideOnSearchFocus $isSearchFocused={isSearchFocused}>
                    <ToolbarGroup>
                        <ThemeToggle />
                        <AtomToolbarButton
                            label={t('common.My profile')}
                            icon={mdiAccount}
                            onClick={() => navigate('/profile/backups')}
                        />
                        <AtomToolbarButton
                            label={t('common.Logout')}
                            icon={mdiLogout}
                            onClick={signOut}
                        />
                    </ToolbarGroup>
                </HideOnSearchFocus>
            </Toolbar>
            {showFolders && (
                <DialogFolderList onClose={() => setShowFolders(false)} />
            )}
        </>
    );
};

OrganismAppBar.displayName = 'OrganismAppBar';
OrganismAppBar.propTypes = {
    signOut: PropTypes.func,
    marginBottom: PropTypes.string,
};

export default OrganismAppBar;
