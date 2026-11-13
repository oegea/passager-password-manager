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
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import { ITEM_TYPES } from '../../../libs/items.js';
import { ITEM_ICONS } from '../../../libs/itemIcons.js';

const Selector = styled.div`
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(5, 1fr);
    margin-bottom: 24px;
`;

const Option = styled.button`
    align-items: center;
    appearance: none;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    gap: 6px;
    min-width: 0;
    padding: 12px 4px 10px;
    transition: background-color var(--duration-fast) ease,
        border-color var(--duration-fast) ease, color var(--duration-fast) ease,
        transform var(--duration-fast) var(--ease-out);

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    &:active {
        transform: scale(0.96);
    }

    &[aria-pressed='true'] {
        background: var(--color-accent-soft);
        border-color: var(--color-accent);
        color: var(--color-accent);
    }

    & span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

/** Lets the user choose what kind of item is being created. */
const MoleculeItemTypeSelector = ({ value, onChange }) => {
    const { t } = useTranslation();

    return (
        <Selector role="group" aria-label={t('items.Type')}>
            {ITEM_TYPES.map((type) => (
                <Option
                    key={type}
                    type="button"
                    aria-pressed={value === type}
                    data-testid={`item-type-${type}`}
                    onClick={() => onChange(type)}
                >
                    <Icon path={ITEM_ICONS[type].icon} size={0.9} />
                    <span>{t(`items.types.${type}`)}</span>
                </Option>
            ))}
        </Selector>
    );
};

MoleculeItemTypeSelector.displayName = 'MoleculeItemTypeSelector';
MoleculeItemTypeSelector.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default MoleculeItemTypeSelector;
