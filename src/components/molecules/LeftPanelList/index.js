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
import { Link } from 'react-router-dom';

const LeftPanelListItem = styled.div`
    align-items: center;
    display: flex;
    margin-bottom: 20px;

    &:hover, &[data-isactive='true']{
        cursor: pointer;
        font-weight: bold;
        span {
            display: inline-block;
        }
    }

    & a {
        text-decoration: none;
        color: inherit;
    }
`;

const MoleculeLeftPanelList = ({onChange = () => null, folders, selectedFolder}) => {

    return <>
        {folders.map((folder, index) => 
            <LeftPanelListItem 
                key={`folder-${index}`} 
                data-isactive={(selectedFolder === folder.id)}
            >
                <Link to={`/${folder.id}`} onClick={onChange}>
                    {folder.name}
                </Link>
            </LeftPanelListItem>
        )}
    </>
}

MoleculeLeftPanelList.displayName = 'MoleculeLeftPanelList';
MoleculeLeftPanelList.propTypes = {
    onChange: PropTypes.func,
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default MoleculeLeftPanelList;