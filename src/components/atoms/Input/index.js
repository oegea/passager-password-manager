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
import styled from 'styled-components';

const Input = styled.input`
    appearance: none;
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-family: inherit;
    font-size: 15px;
    height: 42px;
    padding: 0 12px;
    transition: border-color var(--duration-fast) ease,
        box-shadow var(--duration-fast) ease,
        background-color var(--duration-fast) ease;
    width: 100%;

    &::placeholder {
        color: var(--color-text-faint);
    }

    &:hover {
        border-color: var(--color-text-faint);
    }

    &:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 4px var(--color-accent-ring);
        outline: none;
    }

    &[data-monospace='true'] {
        font-family: var(--font-mono);
        font-size: 13px;
    }
`;
const AtomInput = (props) => {
    return <Input {...props} />;
};

AtomInput.displayName = 'AtomInput';

export default AtomInput;
