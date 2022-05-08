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
// Context
import withUser from '../../../providers/WithUser.js';

const UserDetailsRightPanel = ({user}) => {
    const { t } = useTranslation();
    console.log(user)
    return (
        <>
            <SectionTitle title={t('profile.User details')} buttons={[]}/>

            <p>
                <strong>{t('profile.Name')}: </strong>{user.displayName || '-'}
            </p>

            <p>
                <strong>{t('profile.Email')}: </strong>{user.email || '-'}
            </p>

            <p>
                <strong>{t('profile.Id')}: </strong>{user.uid || '-'}
            </p>
            
        </>
    )
}

UserDetailsRightPanel.displayName = 'UserDetailsRightPanel';
UserDetailsRightPanel.propTypes = {
}

export default withUser(UserDetailsRightPanel);