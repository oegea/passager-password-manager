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
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from "react-router-dom";
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import LeftPanelList from '../../molecules/LeftPanelList/index.js';
// Organisms
import FolderFormDialog from '../FolderFormDialog/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libraries
import { createFolder } from '../../../libs/folders.js';
// Context
import withUsers from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';

const FoldersListLeftPanel = ({user, folders, sharedFolders, onChange = () => null}) => {
    const {folderId} = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);

    const onCreateFolder = async (folder) => {
        const folderDoc = await createFolder(user, folder)
        if (folderDoc?.id){
            navigate('/' + folderDoc.id);
            onChange();
        } 
    }

    return (
        <>
            <SectionTitle title={t('common.Folders')} buttons={[{label: t('common.Create'), onClick: ()=>setShowNewFolderDialog(true)}]}/>
            {
                showNewFolderDialog && 
                <FolderFormDialog 
                    onSave={(folder) => onCreateFolder(folder)} 
                    closeDialog={()=>setShowNewFolderDialog(false)} 
                /> 
            }
            <LeftPanelList onChange={onChange} folders={folders} selectedFolder={folderId} />

            <LeftPanelList onChange={onChange} folders={sharedFolders} selectedFolder={folderId} />
            
        </>
    )
}

FoldersListLeftPanel.displayName = 'FoldersListLeftPanel';
FoldersListLeftPanel.propTypes = {
    folders: PropTypes.array,
    sharedFolders: PropTypes.array,
    user: PropTypes.object,
    onChange: PropTypes.func,
}

export default withUsers(withFolders(FoldersListLeftPanel));