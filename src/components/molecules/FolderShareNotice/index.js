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
// Atoms
import Title from '../../atoms/Title/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const FolderShareNotice = styled.div`
    margin-top: 20px;
`;
const MoleculeFolderShareNotice = ({email}) => {

    const {t} = useTranslation();

    return <FolderShareNotice>
        <Title>
            {t('folderShareNotice.You will share this folder with')}
            {email}
        </Title>
        <ul>
            <li>{t('folderShareNotice.This person will be able to access this folder, as well as view and modify contained passwords')}</li>
            <li>{t('folderShareNotice.This person will not be able to delete this folder or share it with additional people')}</li>
        </ul>
    </FolderShareNotice>
}

MoleculeFolderShareNotice.displayName = 'MoleculeFolderShareNotice';
MoleculeFolderShareNotice.propTypes = {
    email: PropTypes.string
};

export default MoleculeFolderShareNotice;