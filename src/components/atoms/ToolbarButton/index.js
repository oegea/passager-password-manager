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
import Icon from '../Icon/index.js';

const Button = styled.button`
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
    padding: 0 12px;
    transition: background-color var(--duration-fast) ease,
        color var(--duration-fast) ease,
        transform var(--duration-fast) var(--ease-out);
    white-space: nowrap;

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    &:active {
        transform: scale(0.96);
    }

    @media (max-width: 768px) {
        padding: 0 9px;
    }
`;

const ButtonLabel = styled.span`
    @media (max-width: 768px) {
        display: none;
    }
`;

const AtomToolbarButton = ({ label, onClick, icon }) => {
    return (
        <Button type="button" onClick={onClick} title={label}>
            {icon && <Icon path={icon} size={0.8} />}
            <ButtonLabel>{label}</ButtonLabel>
        </Button>
    );
};

AtomToolbarButton.displayName = 'AtomToolbarButton';
AtomToolbarButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string,
};

export default AtomToolbarButton;
