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

const ButtonLink = styled.button`
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    margin: 0 2px;
    padding: 4px 6px;
    text-decoration: underline;
    text-decoration-color: var(--color-border-strong);
    text-underline-offset: 3px;
    transition: color var(--duration-fast) ease,
        text-decoration-color var(--duration-fast) ease;
    ${(props) => (props.$noPaddingLeft ? 'padding-left: 0;' : '')}
    margin-top: ${(props) => props.$marginTop};

    &:hover {
        color: var(--color-accent);
        text-decoration-color: var(--color-accent);
    }
`;

const AtomButtonLink = ({
    children,
    onClick,
    noPaddingLeft = false,
    marginTop = '0',
}) => {
    return (
        <ButtonLink
            type="button"
            onClick={onClick}
            $noPaddingLeft={noPaddingLeft}
            $marginTop={marginTop}
        >
            {children}
        </ButtonLink>
    );
};

AtomButtonLink.displayName = 'AtomButtonLink';
AtomButtonLink.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    noPaddingLeft: PropTypes.bool,
    marginTop: PropTypes.string,
};

export default AtomButtonLink;
