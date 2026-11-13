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
 * Profiles: several accounts in the same browser, like browser profiles.
 *
 * The ACTIVE profile lives in localStorage exactly where a single account
 * always lived (`storeMode`, `jwtToken`, `users`, `folders`...). Nothing in
 * the rest of the application needs to know about profiles, and data from
 * versions without profiles is simply the first profile.
 *
 * INACTIVE profiles are kept aside, each one as a snapshot of its keys under
 * `profile:<id>`. Switching swaps the snapshots and reloads the application.
 *
 * A few keys belong to the device, not to an account (theme, language...),
 * and never move.
 *
 * A profile stays in the list until it is removed on purpose: an expired or
 * closed session only means signing in again.
 */

const REGISTRY_KEY = 'profiles';
const ACTIVE_KEY = 'activeProfile';
const SNAPSHOT_PREFIX = 'profile:';

export const PROFILE_TYPE_LOCAL = 'LOCAL';
export const PROFILE_TYPE_BACKEND = 'BACKEND';
export const PROFILE_TYPE_NEW = 'NEW';

/** Keys that belong to this device, whatever the account is. */
const DEVICE_KEYS = [
    'theme',
    'language',
    'installDismissed',
    'privacyAccepted',
];

/** Keys a local vault is made of (besides `folders.<id>.passwords`). */
const LOCAL_VAULT_KEYS = ['auth', 'users', 'userSharingSettings', 'folders'];

const isLocalVaultKey = (key) =>
    LOCAL_VAULT_KEYS.includes(key) || /^folders\..+\.passwords$/.test(key);

/** Whether a key belongs to the active profile. */
export const isProfileKey = (key) =>
    key !== REGISTRY_KEY &&
    key !== ACTIVE_KEY &&
    !key.startsWith(SNAPSHOT_PREFIX) &&
    !DEVICE_KEYS.includes(key);

const getAllKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    return keys;
};

const createId = () =>
    Array.from(globalThis.crypto.getRandomValues(new Uint8Array(8)), (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('');

const readJson = (value, fallback) => {
    try {
        const parsed = JSON.parse(value);
        return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
        return fallback;
    }
};

const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(payload));
    } catch (e) {
        return null;
    }
};

// #region Registry
const readRegistry = () => {
    const registry = readJson(localStorage.getItem(REGISTRY_KEY), []);
    return Array.isArray(registry)
        ? registry.filter((profile) => profile && typeof profile.id === 'string')
        : [];
};

const writeRegistry = (registry) =>
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));

export const getActiveProfileId = () => localStorage.getItem(ACTIVE_KEY);
// #endregion

// #region Snapshots
/** The keys of the active profile, as they are in localStorage. */
const takeSnapshot = () => {
    const snapshot = {};
    for (const key of getAllKeys())
        if (isProfileKey(key)) snapshot[key] = localStorage.getItem(key);
    return snapshot;
};

const clearActiveKeys = () => {
    for (const key of getAllKeys())
        if (isProfileKey(key)) localStorage.removeItem(key);
};

const restoreSnapshot = (snapshot) => {
    for (const key of Object.keys(snapshot))
        if (isProfileKey(key)) localStorage.setItem(key, snapshot[key]);
};

const readSnapshot = (id) =>
    readJson(localStorage.getItem(SNAPSHOT_PREFIX + id), {});

/**
 * What a set of keys says about the account they belong to.
 * `previous` keeps what can not be known anymore (the e-mail of a session
 * that has been closed).
 */
const describe = (keys, previous = {}) => {
    const hasBackend = Boolean(keys.documentsUrl) || keys.storeMode === 'BACKEND';
    const hasLocalVault = Boolean(keys.users) || keys.storeMode === 'LOCAL';

    if (hasBackend) {
        const token = keys.jwtToken ? decodeToken(keys.jwtToken) : null;
        const isSignedIn =
            token !== null &&
            typeof token.exp === 'number' &&
            token.exp * 1000 > Date.now();
        return {
            type: PROFILE_TYPE_BACKEND,
            email: (token && token.email) || previous.email || '',
            server: keys.documentsUrl || previous.server || '',
            isSignedIn,
        };
    }

    if (hasLocalVault)
        return {
            type: PROFILE_TYPE_LOCAL,
            email: '',
            server: '',
            isSignedIn: true,
        };

    return { type: PROFILE_TYPE_NEW, email: '', server: '', isSignedIn: false };
};
// #endregion

/**
 * Versions without profiles allowed a local vault and an organization
 * account to share the same storage, one of them "closed". They become two
 * profiles. Returns the snapshot of the one that is not in use, or null.
 */
const splitLegacyStorage = () => {
    const keys = takeSnapshot();
    const hasBackend = Boolean(keys.documentsUrl) || Boolean(keys.jwtToken);
    const hasLocalVault = Boolean(keys.users);
    if (!hasBackend || !hasLocalVault) return null;

    const isLocalActive = keys.storeMode === 'LOCAL';
    const moved = {};
    for (const key of Object.keys(keys)) {
        if (key === 'storeMode') continue;
        const belongsToLocal = isLocalVaultKey(key);
        // Biometric data belongs to whoever enrolled, which was the one in use
        const isBiometric = key.startsWith('biometric');
        const staysActive = isBiometric
            ? true
            : isLocalActive
                ? belongsToLocal
                : !belongsToLocal;
        if (!staysActive) {
            moved[key] = keys[key];
            localStorage.removeItem(key);
        }
    }
    moved.storeMode = 'NONE';
    return moved;
};

/**
 * Makes sure the registry describes what is stored. Called once on start,
 * before anything else reads the storage.
 */
export const initProfiles = () => {
    let registry = readRegistry();
    let activeId = getActiveProfileId();

    if (registry.length === 0) {
        // First run with profiles: what is stored becomes the first one(s)
        const other = splitLegacyStorage();
        if (other !== null) {
            const otherId = createId();
            localStorage.setItem(
                SNAPSHOT_PREFIX + otherId,
                JSON.stringify(other)
            );
            registry.push({ id: otherId, ...describe(other) });
        }
        activeId = null;
    }

    if (!activeId || !registry.some((profile) => profile.id === activeId)) {
        activeId = createId();
        registry.push({ id: activeId });
        localStorage.setItem(ACTIVE_KEY, activeId);
    }

    // The active profile is described by what is really stored
    registry = registry.map((profile) =>
        profile.id === activeId
            ? { id: profile.id, ...describe(takeSnapshot(), profile) }
            : profile
    );
    writeRegistry(registry);
    return registry;
};

/**
 * Every profile, the active one included. Sessions are checked again, as
 * tokens expire while the application is open.
 */
export const listProfiles = () => {
    const activeId = getActiveProfileId();
    return readRegistry().map((profile) => {
        const isActive = profile.id === activeId;
        const keys = isActive ? takeSnapshot() : readSnapshot(profile.id);
        return { ...profile, ...describe(keys, profile), isActive };
    });
};

/** Puts the active profile aside, so another one can take its place. */
const storeActiveProfile = () => {
    const activeId = getActiveProfileId();
    if (!activeId) return;

    const snapshot = takeSnapshot();
    const registry = readRegistry();
    const description = describe(
        snapshot,
        registry.find((profile) => profile.id === activeId)
    );

    clearActiveKeys();

    if (description.type === PROFILE_TYPE_NEW) {
        // Nothing was ever set up in it: it is not worth keeping
        writeRegistry(registry.filter((profile) => profile.id !== activeId));
        return;
    }

    localStorage.setItem(SNAPSHOT_PREFIX + activeId, JSON.stringify(snapshot));
    writeRegistry(
        registry.map((profile) =>
            profile.id === activeId ? { id: activeId, ...description } : profile
        )
    );
};

const reload = (path = '/') => {
    window.location.href = path;
};

/**
 * Makes a profile the active one. Its session is used if it is still valid;
 * otherwise the application asks to sign in again.
 */
export const switchProfile = (id) => {
    const registry = readRegistry();
    const target = registry.find((profile) => profile.id === id);
    if (!target) return false;

    if (id !== getActiveProfileId()) {
        const snapshot = readSnapshot(id);
        storeActiveProfile();
        restoreSnapshot(snapshot);
        localStorage.removeItem(SNAPSHOT_PREFIX + id);
        localStorage.setItem(ACTIVE_KEY, id);
    }

    // Opens it: a closed session leads to its sign in page
    const description = describe(takeSnapshot(), target);
    if (description.type === PROFILE_TYPE_BACKEND) {
        localStorage.setItem('storeMode', 'BACKEND');
        reload(description.isSignedIn ? '/' : '/login-backend');
    } else if (description.type === PROFILE_TYPE_LOCAL) {
        localStorage.setItem('storeMode', 'LOCAL');
        reload('/');
    } else {
        reload('/');
    }
    return true;
};

/**
 * Leaves the active profile aside and starts an empty one. Nothing is
 * reloaded: the caller decides what to do next.
 */
export const startNewProfile = () => {
    const current = describe(takeSnapshot());
    if (current.type === PROFILE_TYPE_NEW) return getActiveProfileId();

    storeActiveProfile();
    const id = createId();
    writeRegistry([...readRegistry(), { id, type: PROFILE_TYPE_NEW }]);
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.setItem('storeMode', 'NONE');
    return id;
};

/** Leaves the active profile aside and shows the page to add an account. */
export const addProfile = () => {
    startNewProfile();
    reload('/');
};

/** Identifiers of the folders of a local vault, to remove its files. */
const getLocalFolderIds = (keys) =>
    readJson(keys.folders, [])
        .map((folder) => folder && folder.id)
        .filter(Boolean);

/**
 * Removes a profile and everything it keeps in this device. Data stored in
 * an organization's server is not touched.
 *
 * @param {string} id
 * @param {Function} [removeLocalFiles] Removes the files of some folders
 */
export const removeProfile = async (id, removeLocalFiles = async () => null) => {
    const activeId = getActiveProfileId();
    const isActive = id === activeId;
    const keys = isActive ? takeSnapshot() : readSnapshot(id);

    try {
        await removeLocalFiles(getLocalFolderIds(keys));
    } catch (e) {
        console.error(e);
    }

    if (isActive) clearActiveKeys();
    localStorage.removeItem(SNAPSHOT_PREFIX + id);
    const registry = readRegistry().filter((profile) => profile.id !== id);
    writeRegistry(registry);

    if (!isActive) return;

    // Another profile takes its place, or an empty one if there is none
    localStorage.removeItem(ACTIVE_KEY);
    const next = registry.find((profile) => profile.type !== PROFILE_TYPE_NEW);
    if (next) {
        switchProfile(next.id);
    } else {
        initProfiles();
        localStorage.setItem('storeMode', 'NONE');
        reload('/');
    }
};

/** The keys of the active profile, for a backup. */
export const getActiveProfileKeys = () => takeSnapshot();

/** Replaces the keys of the active profile, when restoring a backup. */
export const replaceActiveProfileKeys = (keys) => {
    clearActiveKeys();
    for (const key of Object.keys(keys)) {
        // A backup never brings other profiles with it
        if (
            key === REGISTRY_KEY ||
            key === ACTIVE_KEY ||
            key.startsWith(SNAPSHOT_PREFIX)
        )
            continue;
        localStorage.setItem(key, keys[key]);
    }
};
