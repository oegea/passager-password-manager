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
import React from 'react';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const UserDetailsRightPanel = () => {
    const { t } = useTranslation();

    if (localStorage.getItem('storeMode') !== 'LOCAL'){
        return (<>
            <SectionTitle title={t('profile.Backups')} buttons={[]}/>
            <p>{t('profile.This feature is only available when passwords are stored locally')}</p>
        </>)
    }

    return (
        <>
            <SectionTitle title={t('profile.Backups')} buttons={[
                {label: t('profile.Download Backup'), onClick: () => alert('This feature is not available yet')},
                {label: t('profile.Import Backup'), onClick: () => alert('This feature is not available yet')},
            ]}/>

            <p>{t('profile.When you store your passwords locally, they are saved in the local storage of your Internet browser')}</p>
            <p>{t('profile.There are certain browser cleaning operations that may delete this information, and may cause you to lose your passwords')}</p>
            <p>{t('profile.It is therefore recommended to regularly download backups via this page and store them on a secure storage device')}</p>
            <p><strong>{t('profile.In case you accidentally delete your data, you can upload a backup copy by clicking on the "Import backup copy" button')}</strong></p>
            <p>{t('profile.In addition, you can upload your backups to other computers to have your passwords available on different devices')}</p>
            
        </>
    )
}

UserDetailsRightPanel.displayName = 'UserDetailsRightPanel';
UserDetailsRightPanel.propTypes = {
}

export default UserDetailsRightPanel;