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

import {
    addProfile,
    getActiveProfileId,
    getActiveProfileKeys,
    initProfiles,
    isProfileKey,
    listProfiles,
    PROFILE_TYPE_BACKEND,
    PROFILE_TYPE_LOCAL,
    PROFILE_TYPE_NEW,
    removeProfile,
    replaceActiveProfileKeys,
    startNewProfile,
    switchProfile,
} from './profiles.js';

const token = (email, expiresInSeconds) => {
    const encode = (value) =>
        btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `${encode({ alg: 'HS256' })}.${encode({ email, exp })}.signature`;
};

const seed = (keys) => {
    for (const [key, value] of Object.entries(keys))
        localStorage.setItem(key, value);
};

const LOCAL_VAULT = {
    storeMode: 'LOCAL',
    auth: '{"uid":"local-1"}',
    users: '[{"uid":"local-1","privateKey":"pv2.abc"}]',
    userSharingSettings: '[{"uid":"local-1","publicKey":"pk"}]',
    folders: '[{"id":"f1","name":"Folder"}]',
    'folders.f1.passwords': '[{"id":"p1","name":"Entry"}]',
};

const organization = (email, expiresInSeconds = 3600) => ({
    storeMode: 'BACKEND',
    documentsUrl: 'https://docs.example.org/',
    authenticationUrl: 'https://auth.example.org/',
    jwtToken: token(email, expiresInSeconds),
});

let location;
beforeEach(() => {
    localStorage.clear();
    location = { href: '', pathname: '/' };
    Object.defineProperty(window, 'location', {
        value: location,
        configurable: true,
        writable: true,
    });
});

describe('first run with data from a version without profiles', () => {
    test('an empty browser gets one empty profile', () => {
        initProfiles();
        const profiles = listProfiles();
        expect(profiles).toHaveLength(1);
        expect(profiles[0]).toMatchObject({
            type: PROFILE_TYPE_NEW,
            isActive: true,
        });
    });

    test('an existing local vault becomes the first profile, untouched', () => {
        seed({ ...LOCAL_VAULT, theme: 'dark', language: 'es' });
        const before = { ...localStorage };
        initProfiles();

        expect(listProfiles()).toMatchObject([
            { type: PROFILE_TYPE_LOCAL, isActive: true },
        ]);
        // Every key is still where older versions expect it
        for (const key of Object.keys(before))
            expect(localStorage.getItem(key)).toBe(before[key]);
    });

    test('an existing organization session becomes the first profile', () => {
        seed(organization('ana@example.org'));
        initProfiles();
        expect(listProfiles()).toMatchObject([
            {
                type: PROFILE_TYPE_BACKEND,
                email: 'ana@example.org',
                server: 'https://docs.example.org/',
                isSignedIn: true,
                isActive: true,
            },
        ]);
        expect(localStorage.getItem('jwtToken')).not.toBe(null);
    });

    test('a local vault and an organization account sharing the storage become two profiles', () => {
        seed({
            ...LOCAL_VAULT,
            ...organization('ana@example.org'),
            biometricEnrollment: '{"owner":"ana@example.org"}',
        });
        initProfiles();

        const profiles = listProfiles();
        expect(profiles).toHaveLength(2);
        const active = profiles.find((profile) => profile.isActive);
        const other = profiles.find((profile) => !profile.isActive);
        expect(active.type).toBe(PROFILE_TYPE_BACKEND);
        expect(other.type).toBe(PROFILE_TYPE_LOCAL);

        // The organization account is in use: the vault moved aside, complete
        expect(localStorage.getItem('users')).toBe(null);
        expect(localStorage.getItem('folders.f1.passwords')).toBe(null);
        expect(localStorage.getItem('jwtToken')).not.toBe(null);
        expect(localStorage.getItem('biometricEnrollment')).not.toBe(null);
        const moved = JSON.parse(localStorage.getItem(`profile:${other.id}`));
        expect(moved.users).toBe(LOCAL_VAULT.users);
        expect(moved['folders.f1.passwords']).toBe(
            LOCAL_VAULT['folders.f1.passwords']
        );

        // And it comes back whole
        switchProfile(other.id);
        for (const key of Object.keys(LOCAL_VAULT))
            if (key !== 'storeMode')
                expect(localStorage.getItem(key)).toBe(LOCAL_VAULT[key]);
        expect(localStorage.getItem('jwtToken')).toBe(null);
        expect(localStorage.getItem('storeMode')).toBe('LOCAL');
    });

    test('running it again changes nothing', () => {
        seed(LOCAL_VAULT);
        initProfiles();
        const snapshot = { ...localStorage };
        initProfiles();
        expect({ ...localStorage }).toEqual(snapshot);
    });
});

describe('switching', () => {
    test('swaps the accounts completely and keeps device settings', () => {
        seed({ ...LOCAL_VAULT, theme: 'dark', language: 'es' });
        initProfiles();
        const localId = getActiveProfileId();

        // A second account is added and signed in
        addProfile();
        expect(location.href).toBe('/');
        expect(localStorage.getItem('users')).toBe(null);
        expect(localStorage.getItem('storeMode')).toBe('NONE');
        expect(localStorage.getItem('theme')).toBe('dark');
        seed(organization('ana@example.org'));
        initProfiles();
        const organizationId = getActiveProfileId();
        expect(organizationId).not.toBe(localId);
        expect(listProfiles()).toHaveLength(2);

        // Back to the vault
        switchProfile(localId);
        expect(location.href).toBe('/');
        expect(getActiveProfileId()).toBe(localId);
        for (const key of Object.keys(LOCAL_VAULT))
            expect(localStorage.getItem(key)).toBe(LOCAL_VAULT[key]);
        expect(localStorage.getItem('jwtToken')).toBe(null);
        expect(localStorage.getItem('documentsUrl')).toBe(null);
        expect(localStorage.getItem('language')).toBe('es');

        // And to the organization again, with its session
        switchProfile(organizationId);
        expect(location.href).toBe('/');
        expect(localStorage.getItem('jwtToken')).toBe(
            organization('ana@example.org').jwtToken
        );
        expect(localStorage.getItem('users')).toBe(null);
        expect(listProfiles()).toHaveLength(2);
    });

    test('an expired session keeps the account and asks to sign in', () => {
        seed(organization('ana@example.org', -60));
        initProfiles();
        const expiredId = getActiveProfileId();
        addProfile();
        seed(LOCAL_VAULT);
        initProfiles();

        const expired = listProfiles().find((p) => p.id === expiredId);
        expect(expired).toMatchObject({
            type: PROFILE_TYPE_BACKEND,
            email: 'ana@example.org',
            isSignedIn: false,
        });

        switchProfile(expiredId);
        expect(location.href).toBe('/login-backend');
        expect(localStorage.getItem('documentsUrl')).toBe(
            'https://docs.example.org/'
        );
        expect(localStorage.getItem('storeMode')).toBe('BACKEND');

        // Signing in again refreshes the stored session of the same account
        localStorage.setItem('jwtToken', token('ana@example.org', 3600));
        initProfiles();
        expect(listProfiles().filter((p) => p.id === expiredId)).toMatchObject(
            [{ isSignedIn: true, isActive: true }]
        );
        expect(listProfiles()).toHaveLength(2);
    });

    test('a closed session remembers whose account it is', () => {
        seed(organization('ana@example.org'));
        initProfiles();
        // What "Logout" does
        localStorage.setItem('storeMode', 'NONE');
        localStorage.removeItem('jwtToken');
        initProfiles();
        expect(listProfiles()).toMatchObject([
            {
                type: PROFILE_TYPE_BACKEND,
                email: 'ana@example.org',
                isSignedIn: false,
            },
        ]);
    });

    test('an account that was never set up is not kept', () => {
        seed(LOCAL_VAULT);
        initProfiles();
        const localId = getActiveProfileId();
        addProfile();
        expect(listProfiles()).toHaveLength(2);
        switchProfile(localId);
        expect(listProfiles()).toHaveLength(1);
    });

    test('adding an account from an empty one starts nothing new', () => {
        initProfiles();
        const id = getActiveProfileId();
        expect(startNewProfile()).toBe(id);
        expect(listProfiles()).toHaveLength(1);
    });

    test('ignores unknown profiles', () => {
        seed(LOCAL_VAULT);
        initProfiles();
        expect(switchProfile('nope')).toBe(false);
        expect(localStorage.getItem('users')).toBe(LOCAL_VAULT.users);
    });
});

describe('removing', () => {
    test('removes an inactive account and its local files', async () => {
        seed(LOCAL_VAULT);
        initProfiles();
        const localId = getActiveProfileId();
        addProfile();
        seed(organization('ana@example.org'));
        initProfiles();

        const removeLocalFiles = vi.fn();
        await removeProfile(localId, removeLocalFiles);

        expect(removeLocalFiles).toHaveBeenCalledWith(['f1']);
        expect(localStorage.getItem(`profile:${localId}`)).toBe(null);
        expect(listProfiles()).toMatchObject([
            { type: PROFILE_TYPE_BACKEND, isActive: true },
        ]);
        // The account in use is untouched
        expect(localStorage.getItem('jwtToken')).not.toBe(null);
    });

    test('removing the account in use opens another one', async () => {
        seed(LOCAL_VAULT);
        initProfiles();
        const localId = getActiveProfileId();
        addProfile();
        seed(organization('ana@example.org'));
        initProfiles();
        const organizationId = getActiveProfileId();

        await removeProfile(organizationId);

        expect(getActiveProfileId()).toBe(localId);
        expect(localStorage.getItem('jwtToken')).toBe(null);
        expect(localStorage.getItem('documentsUrl')).toBe(null);
        expect(localStorage.getItem('users')).toBe(LOCAL_VAULT.users);
        expect(listProfiles()).toHaveLength(1);
    });

    test('removing the only account leaves an empty one', async () => {
        seed({ ...LOCAL_VAULT, theme: 'dark' });
        initProfiles();
        await removeProfile(getActiveProfileId());

        expect(localStorage.getItem('users')).toBe(null);
        expect(localStorage.getItem('folders.f1.passwords')).toBe(null);
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(listProfiles()).toMatchObject([
            { type: PROFILE_TYPE_NEW, isActive: true },
        ]);
        expect(location.href).toBe('/');
    });
});

describe('backups', () => {
    test('only carry the account in use', () => {
        seed({ ...LOCAL_VAULT, theme: 'dark' });
        initProfiles();
        addProfile();
        seed(organization('ana@example.org'));
        initProfiles();

        const keys = getActiveProfileKeys();
        expect(keys.jwtToken).toBeDefined();
        expect(keys.users).toBeUndefined();
        expect(Object.keys(keys).some((key) => !isProfileKey(key))).toBe(false);
    });

    test('restoring one replaces the account in use and nothing else', () => {
        seed(LOCAL_VAULT);
        initProfiles();
        const firstId = getActiveProfileId();
        addProfile();
        seed({ ...LOCAL_VAULT, users: '[{"uid":"second"}]' });
        initProfiles();
        const registry = localStorage.getItem('profiles');

        replaceActiveProfileKeys({
            storeMode: 'LOCAL',
            users: '[{"uid":"restored"}]',
            // A backup can not bring profiles of its own
            profiles: '[]',
            activeProfile: 'x',
            'profile:evil': '{}',
        });

        expect(localStorage.getItem('users')).toBe('[{"uid":"restored"}]');
        expect(localStorage.getItem('folders')).toBe(null);
        expect(localStorage.getItem('profiles')).toBe(registry);
        expect(localStorage.getItem('profile:evil')).toBe(null);
        expect(
            JSON.parse(localStorage.getItem(`profile:${firstId}`)).users
        ).toBe(LOCAL_VAULT.users);
    });
});
