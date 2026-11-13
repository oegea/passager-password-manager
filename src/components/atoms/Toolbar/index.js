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

export const DEFAULT_TOOLBAR_HEIGHT = 64;

const Toolbar = styled.div`
    align-items: center;
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    background: var(--color-glass);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    display: flex;
    gap: 16px;
    height: ${DEFAULT_TOOLBAR_HEIGHT}px;
    justify-content: space-between;
    margin-bottom: ${(props) => props.$marginBottom};
    padding: 0 24px;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 100;

    @media (max-width: 768px) {
        gap: 8px;
        padding: 0 12px;
    }
`;

const AtomToolbar = ({ children, marginBottom = '35px' }) => {
    return <Toolbar $marginBottom={marginBottom}>{children}</Toolbar>;
};

AtomToolbar.displayName = 'AtomToolbar';
AtomToolbar.propTypes = {
    children: PropTypes.node,
    marginBottom: PropTypes.string,
};

export default AtomToolbar;
