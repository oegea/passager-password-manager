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
import { useCallback, useState } from 'react';
// Hooks
import useTranslation from '../useTranslation/index.js';
// Own libs
import {
    listProfiles,
    PROFILE_TYPE_BACKEND,
    PROFILE_TYPE_LOCAL,
    PROFILE_TYPE_NEW,
} from '../../libs/profiles.js';

const getHost = (url) => {
    try {
        return new URL(url).host;
    } catch (e) {
        return url;
    }
};

/**
 * The accounts kept in this browser, ready to be shown: with a name, a
 * detail line and whether their session is open.
 */
const useProfiles = () => {
    const { t } = useTranslation();
    const [version, setVersion] = useState(0);
    const refresh = useCallback(() => setVersion((value) => value + 1), []);

    // Read again on every render: sessions expire while the app is open
    void version;
    const stored = listProfiles().filter(
        (profile) => profile.type !== PROFILE_TYPE_NEW || profile.isActive
    );
    const localCount = stored.filter(
        (profile) => profile.type === PROFILE_TYPE_LOCAL
    ).length;

    let localIndex = 0;
    const profiles = stored
        .filter((profile) => profile.type !== PROFILE_TYPE_NEW)
        .map((profile) => {
            if (profile.type === PROFILE_TYPE_BACKEND)
                return {
                    ...profile,
                    name: profile.email || t('profiles.Organization account'),
                    detail: getHost(profile.server),
                };
            localIndex++;
            return {
                ...profile,
                name:
                    localCount > 1
                        ? `${t('profiles.Local vault')} ${localIndex}`
                        : t('profiles.Local vault'),
                detail: t('profiles.Stored in this device'),
            };
        });

    return {
        profiles,
        active: profiles.find((profile) => profile.isActive) || null,
        refresh,
    };
};

export default useProfiles;
