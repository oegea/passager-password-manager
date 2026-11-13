/**
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 *
 * Copyright (C) 2022 Oriol Egea Carvajal
 * Licensed under the GNU Affero General Public License v3 or later.
 */

/*
 * Passager service worker: keeps a copy of the application shell so the app
 * can be installed and opened offline.
 *
 * - Only same-origin GET requests for files of this build are served from
 *   the cache. Requests to Passager backends (other origins, or anything that
 *   is not a file of the build) always go to the network untouched.
 * - `BUILD_ID` and `PRECACHE_FILES` are written by `bin/postbuild.js`, so
 *   every build produces a different service worker and browsers pick up
 *   new versions.
 * - A new version is downloaded completely before being offered, and only
 *   takes control when the page asks for it (`SKIP_WAITING`).
 */

const BUILD_ID = '__BUILD_ID__';
const PRECACHE_FILES = ['__PRECACHE_FILES__'];

const CACHE_PREFIX = 'passager-shell-';
const CACHE_NAME = CACHE_PREFIX + BUILD_ID;
const APP_SHELL = '/index.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) =>
                cache.addAll(
                    PRECACHE_FILES.map(
                        (file) => new Request(file, { cache: 'reload' })
                    )
                )
            )
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((names) =>
                Promise.all(
                    names
                        .filter(
                            (name) =>
                                name.startsWith(CACHE_PREFIX) &&
                                name !== CACHE_NAME
                        )
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Navigations get the application shell (client side routing)
    if (request.mode === 'navigate') {
        // Files with an extension that are not part of the build must reach
        // the server (e.g. a backend mounted in the same origin)
        if (/\.[a-z0-9]+$/i.test(url.pathname) && url.pathname !== APP_SHELL)
            return;
        event.respondWith(
            caches
                .open(CACHE_NAME)
                .then((cache) => cache.match(APP_SHELL))
                .then((response) => response || fetch(request))
        );
        return;
    }

    if (!PRECACHE_FILES.includes(url.pathname)) return;

    event.respondWith(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.match(url.pathname))
            .then((response) => response || fetch(request))
    );
});
