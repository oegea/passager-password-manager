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
// Atoms
import Icon from '../../atoms/Icon/index.js';
// Own libs
import { getItemType, ITEM_TYPE_PASSWORD } from '../../../libs/items.js';
import { ITEM_ICONS } from '../../../libs/itemIcons.js';

const Wrapper = styled.span`
    align-items: center;
    display: flex;
    gap: 12px;
    min-width: 0;
`;

const Badge = styled.span`
    align-items: center;
    border-radius: 10px;
    display: inline-flex;
    flex-shrink: 0;
    height: 34px;
    justify-content: center;
    transition: transform var(--duration-base) var(--ease-spring);
    width: 34px;

    tr:hover & {
        transform: scale(1.08) rotate(-4deg);
    }
`;

const Name = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

/** Name of an item with the icon of its type. */
const MoleculeItemName = ({ name, type }) => {
    const { icon, color } = ITEM_ICONS[type] || ITEM_ICONS[ITEM_TYPE_PASSWORD];
    return (
        <Wrapper>
            <Badge
                data-item-type={type}
                style={{ background: `${color}22`, color }}
            >
                <Icon path={icon} size={0.75} />
            </Badge>
            <Name>{name}</Name>
        </Wrapper>
    );
};

MoleculeItemName.displayName = 'MoleculeItemName';
MoleculeItemName.propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
};

/**
 * Rows of the items table: the name with its icon, and the website of a
 * password or the kind of item for the rest.
 */
export const getItemRows = (items, t) =>
    items.map((item) => {
        const type = getItemType(item.url);
        return [
            <MoleculeItemName
                key="name"
                name={item.name || ''}
                type={type}
            />,
            type === ITEM_TYPE_PASSWORD
                ? item.url || ''
                : t(`items.types.${type}`),
        ];
    });

export default MoleculeItemName;
