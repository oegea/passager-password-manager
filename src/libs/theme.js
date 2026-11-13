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

/**
 * Light / dark theme. The choice is stored in this device; without a choice
 * the system preference is followed.
 */

const STORAGE_KEY = 'theme';
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';
const THEMES = [THEME_LIGHT, THEME_DARK];
const THEME_COLORS = { light: '#ffffff', dark: '#0f1217' };

const listeners = new Set();

const getSystemTheme = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_DARK
        : THEME_LIGHT;

const getStoredTheme = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return THEMES.includes(stored) ? stored : null;
    } catch (e) {
        return null;
    }
};

/** The theme currently in use. */
export const getTheme = () => getStoredTheme() || getSystemTheme();

const applyTheme = () => {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
    listeners.forEach((listener) => listener(theme));
    return theme;
};

export const setTheme = (theme) => {
    if (!THEMES.includes(theme)) return getTheme();
    localStorage.setItem(STORAGE_KEY, theme);
    return applyTheme();
};

export const toggleTheme = () =>
    setTheme(getTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK);

export const subscribeToTheme = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/** Applies the theme and keeps following the system while there is no choice. */
export const initTheme = () => {
    applyTheme();
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
        if (getStoredTheme() === null) applyTheme();
    };
    if (typeof query.addEventListener === 'function')
        query.addEventListener('change', onChange);
};
