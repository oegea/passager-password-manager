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

const Button = styled.div`
    background-color: #d32f2f;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    padding: 5px;
    font-weight: 600;

    &:hover{
        background: #ba2929;
    }
`;

const AtomAlertButton = ({label, onClick}) => {
    return <Button 
        onClick={onClick} 
    >{label}</Button>
}

AtomAlertButton.displayName = 'AtomAlertButton';
AtomAlertButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func
}

export default AtomAlertButton;