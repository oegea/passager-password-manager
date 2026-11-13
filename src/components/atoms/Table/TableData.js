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

const TableData = styled.td`
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
    max-width: 0;
    overflow: hidden;
    padding: 14px 16px;
    text-overflow: ellipsis;
    transition: background-color var(--duration-fast) ease;
    white-space: nowrap;

    &:first-child {
        color: var(--color-text);
        font-weight: 600;
    }
`;
const AtomTableData = (props) => {
    return <TableData {...props} />;
};

AtomTableData.displayName = 'AtomTableData';

export default AtomTableData;
