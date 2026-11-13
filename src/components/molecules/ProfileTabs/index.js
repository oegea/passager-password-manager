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
import styled from 'styled-components';
import { Link } from 'react-router-dom';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const Tabs = styled.nav`
    background: var(--color-surface-sunken);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    display: none;
    gap: 4px;
    margin-bottom: 24px;
    padding: 4px;

    @media (max-width: 768px) {
        display: flex;
    }

    & a {
        border-radius: var(--radius-full);
        color: var(--color-text-muted);
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        padding: 8px 12px;
        text-align: center;
        text-decoration: none;
        transition: background-color var(--duration-fast) ease,
            color var(--duration-fast) ease;
    }

    & a[aria-current='page'] {
        background: var(--color-surface);
        box-shadow: var(--shadow-sm);
        color: var(--color-text);
    }
`;

/**
 * Sections of the profile on small screens, where the side panel that
 * lists them is hidden.
 */
const MoleculeProfileTabs = ({ selectedItem }) => {
    const { t } = useTranslation();
    const items = [
        { id: 'profile', name: t('profile.User details') },
        { id: 'profile/backups', name: t('profile.Backups') },
    ];

    return (
        <Tabs data-testid="profile-tabs">
            {items.map((item) => (
                <Link
                    key={item.id}
                    to={`/${item.id}`}
                    aria-current={selectedItem === item.id ? 'page' : undefined}
                >
                    {item.name}
                </Link>
            ))}
        </Tabs>
    );
};

MoleculeProfileTabs.displayName = 'MoleculeProfileTabs';
MoleculeProfileTabs.propTypes = {
    selectedItem: PropTypes.string,
};

export default MoleculeProfileTabs;
