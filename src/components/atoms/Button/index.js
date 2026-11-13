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
import styled, { css } from 'styled-components';
// Atoms
import Icon from '../Icon/index.js';

const variants = {
    secondary: css`
        background: var(--color-surface);
        border-color: var(--color-border);
        color: var(--color-text);
        box-shadow: var(--shadow-sm);

        &:hover {
            background: var(--color-surface-hover);
            border-color: var(--color-border-strong);
        }
    `,
    primary: css`
        background: var(--color-accent);
        border-color: transparent;
        color: var(--color-accent-contrast);
        box-shadow: 0 4px 14px var(--color-accent-ring);

        &:hover {
            background: var(--color-accent-hover);
        }
    `,
    danger: css`
        background: var(--color-danger-soft);
        border-color: transparent;
        color: var(--color-danger);

        &:hover {
            background: var(--color-danger);
            color: #ffffff;
        }
    `,
    ghost: css`
        background: transparent;
        border-color: transparent;
        color: var(--color-text-muted);

        &:hover {
            background: var(--color-surface-hover);
            color: var(--color-text);
        }
    `,
};

export const ButtonBase = styled.button`
    align-items: center;
    appearance: none;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    display: inline-flex;
    flex-shrink: 0;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    gap: 8px;
    justify-content: center;
    line-height: 1;
    min-height: 38px;
    padding: 0 14px;
    transition: background-color var(--duration-fast) ease,
        border-color var(--duration-fast) ease, color var(--duration-fast) ease,
        box-shadow var(--duration-fast) ease,
        transform var(--duration-fast) var(--ease-out);
    user-select: none;
    white-space: nowrap;

    &:active {
        transform: scale(0.97);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    ${(props) => variants[props.$variant] || variants.secondary}

    ${(props) =>
        props.$fullWidth &&
        css`
            min-height: 46px;
            width: 100%;
        `}
`;

const AtomButton = ({
    label,
    onClick,
    variant = 'secondary',
    icon,
    disabled = false,
    fullWidth = false,
    testId,
}) => {
    return (
        <ButtonBase
            type="button"
            onClick={onClick}
            $variant={variant}
            $fullWidth={fullWidth}
            disabled={disabled}
            data-testid={testId}
        >
            {icon && <Icon path={icon} size={0.72} />}
            {label}
        </ButtonBase>
    );
};

AtomButton.displayName = 'AtomButton';
AtomButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['secondary', 'primary', 'danger', 'ghost']),
    icon: PropTypes.string,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    testId: PropTypes.string,
};

export default AtomButton;
