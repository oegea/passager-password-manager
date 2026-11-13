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
import { useEffect, useState } from 'react';
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
// Atoms
import IconButton from '../IconButton/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Own libs
import {
    getTheme,
    subscribeToTheme,
    toggleTheme,
    THEME_DARK,
} from '../../../libs/theme.js';

/** Switches between the light and the dark theme. */
const AtomThemeToggle = () => {
    const { t } = useTranslation();
    const [theme, setThemeState] = useState(getTheme);

    useEffect(() => subscribeToTheme(setThemeState), []);

    const isDark = theme === THEME_DARK;

    return (
        <IconButton
            testId="theme-toggle"
            icon={isDark ? mdiWhiteBalanceSunny : mdiWeatherNight}
            label={
                isDark
                    ? t('theme.Switch to light mode')
                    : t('theme.Switch to dark mode')
            }
            onClick={() => toggleTheme()}
        />
    );
};

AtomThemeToggle.displayName = 'AtomThemeToggle';

export default AtomThemeToggle;
