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

const Message = styled.span`
    animation: passager-fade-up var(--duration-base) var(--ease-out);
    color: var(--color-danger);
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-top: 6px;
`;

/** Validation message shown under a field. */
const AtomFieldError = ({ children }) => {
    if (!children) return null;
    return <Message role="alert">{children}</Message>;
};

AtomFieldError.displayName = 'AtomFieldError';
AtomFieldError.propTypes = {
    children: PropTypes.node,
};

export default AtomFieldError;
