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
import { mdiFolder, mdiFolderOutline } from '@mdi/js';
// Atoms
import Icon from '../../atoms/Icon/index.js';

const LeftPanelListItem = styled.div`
    animation: passager-fade-up var(--duration-base) var(--ease-out) both;
    margin-bottom: 2px;

    & a {
        align-items: center;
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        display: flex;
        font-weight: 500;
        gap: 10px;
        padding: 9px 12px;
        text-decoration: none;
        transition: background-color var(--duration-fast) ease,
            color var(--duration-fast) ease,
            transform var(--duration-fast) var(--ease-out);
    }

    & a:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    & a:active {
        transform: scale(0.98);
    }

    &[data-isactive='true'] a {
        background: var(--color-accent-soft);
        color: var(--color-accent);
        font-weight: 600;
    }

    & svg {
        flex-shrink: 0;
    }
`;

const Name = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const MoleculeLeftPanelList = ({
    onChange = () => null,
    items,
    selectedItem = '',
    icon,
    activeIcon,
}) => {
    return (
        <>
            {items.map((item, index) => {
                const isActive = selectedItem === item.id;
                return (
                    <LeftPanelListItem
                        key={`item-${index}`}
                        data-isactive={isActive}
                        style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
                    >
                        <Link to={`/${item.id}`} onClick={onChange}>
                            <Icon
                                path={
                                    isActive
                                        ? item.activeIcon ||
                                          item.icon ||
                                          activeIcon ||
                                          icon ||
                                          mdiFolder
                                        : item.icon || icon || mdiFolderOutline
                                }
                                size={0.75}
                            />
                            <Name>{item.name}</Name>
                        </Link>
                    </LeftPanelListItem>
                );
            })}
        </>
    );
};

MoleculeLeftPanelList.displayName = 'MoleculeLeftPanelList';
MoleculeLeftPanelList.propTypes = {
    onChange: PropTypes.func,
    items: PropTypes.array,
    selectedItem: PropTypes.string,
    icon: PropTypes.string,
    activeIcon: PropTypes.string,
};

export default MoleculeLeftPanelList;
