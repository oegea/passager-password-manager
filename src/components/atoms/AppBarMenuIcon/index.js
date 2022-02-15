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
import Icon from '@mdi/react'
import { mdiMenu } from '@mdi/js'

const MenuIcon = styled.div`
    cursor: pointer;
    display: none;

    @media (max-width: 768px) {
        display: block;
    }
`;

const AtomAppBarMenuIcon = ({onClick}) => {
    return <MenuIcon>
            <Icon onClick={()=>onClick()} size="30px" path={mdiMenu}/>    
        </MenuIcon>
}

AtomAppBarMenuIcon.displayName = 'AtomAppBarMenuIcon';
AtomAppBarMenuIcon.propTypes = {
    onClick: PropTypes.func,
}

export default AtomAppBarMenuIcon;