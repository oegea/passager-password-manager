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
import Icon from '../Icon/index.js';

const Button = styled.button`
    align-items: center;
    appearance: none;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    display: inline-flex;
    flex-shrink: 0;
    height: 38px;
    justify-content: center;
    padding: 0;
    transition: background-color var(--duration-fast) ease,
        color var(--duration-fast) ease,
        transform var(--duration-fast) var(--ease-out);
    width: 38px;

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    &:active {
        transform: scale(0.92);
    }
`;

/**
 * A button that only shows an icon. `label` is what assistive technology
 * reads and what is shown as a tooltip.
 */
const AtomIconButton = ({ icon, label, onClick, testId, size = 0.8 }) => {
    return (
        <Button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            data-testid={testId}
        >
            <Icon path={icon} size={size} />
        </Button>
    );
};

AtomIconButton.displayName = 'AtomIconButton';
AtomIconButton.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    testId: PropTypes.string,
    size: PropTypes.number,
};

export default AtomIconButton;
