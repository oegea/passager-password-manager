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
import PropTypes from 'prop-types';

const Wrapper = styled.div`
    align-items: center;
    display: flex;
    min-height: 100vh;
    justify-content: center;
    background: grey;
`;

const Content = styled.div`
    background: white;
    border-radius: 10px;
    padding: 30px;
`;

const TemplateNotLogged = ({ children }) => {
    return (
        <>
            <Wrapper>
                <Content>{children}</Content>
            </Wrapper>
        </>
    );
};

TemplateNotLogged.displayName = 'TemplateNotLogged';
TemplateNotLogged.propTypes = {
    children: PropTypes.node,
};

export default TemplateNotLogged;
