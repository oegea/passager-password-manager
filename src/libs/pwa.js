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
 * Progressive Web App helpers: service worker registration, updates and
 * installation.
 */

const SERVICE_WORKER_URL = '/service-worker.js';
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

let registration = null;
let installPromptEvent = null;
let hasReloaded = false;
// Whether a previous version of the app was already in control of this page
let hadController = false;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(getPwaState()));

export const isStandalone = () =>
    (typeof window.matchMedia === 'function' &&
        window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

export const isIos = () => {
    const userAgent = window.navigator.userAgent || '';
    return (
        /iPhone|iPad|iPod/.test(userAgent) ||
        // iPadOS identifies itself as a Mac
        (/Macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1)
    );
};

export const getPwaState = () => ({
    // A new version has been downloaded and is waiting to be applied
    updateAvailable:
        hadController && registration !== null && registration.waiting !== null,
    // The browser allows to show its own installation dialog
    canPromptInstall: installPromptEvent !== null,
    // iOS has no installation dialog: it is done from the share menu
    canInstallManually: isIos() && !isStandalone(),
    isStandalone: isStandalone(),
});

/** Subscribes to changes. Returns a function to unsubscribe. */
export const subscribeToPwaState = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/** Applies a downloaded update. The app reloads once it takes control. */
export const applyUpdate = () => {
    if (registration === null || registration.waiting === null) return false;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return true;
};

/** Shows the browser's installation dialog, if available. */
export const promptInstall = async () => {
    if (installPromptEvent === null) return false;
    const event = installPromptEvent;
    installPromptEvent = null;
    notify();
    event.prompt();
    const choice = await event.userChoice;
    return choice && choice.outcome === 'accepted';
};

const watchInstallingWorker = (worker) => {
    if (!worker) return;
    worker.addEventListener('statechange', () => notify());
};

/**
 * Registers the service worker that makes Passager installable and usable
 * offline. Does nothing in development or in unsupported browsers.
 */
export const registerServiceWorker = async () => {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        installPromptEvent = event;
        notify();
    });
    window.addEventListener('appinstalled', () => {
        installPromptEvent = null;
        notify();
    });

    if (
        !import.meta.env.PROD ||
        !('serviceWorker' in navigator) ||
        !window.isSecureContext
    )
        return null;

    try {
        // Only reload when an update replaces a previous version, not when
        // the very first service worker takes control
        hadController = navigator.serviceWorker.controller !== null;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!hadController || hasReloaded) return;
            hasReloaded = true;
            window.location.reload();
        });

        registration = await navigator.serviceWorker.register(
            SERVICE_WORKER_URL,
            { updateViaCache: 'none' }
        );

        // An update downloaded in a previous visit is applied on start, when
        // there is nothing to lose
        if (registration.waiting !== null && hadController) {
            applyUpdate();
        }

        watchInstallingWorker(registration.installing);
        registration.addEventListener('updatefound', () => {
            watchInstallingWorker(registration.installing);
        });

        setInterval(() => {
            registration.update().catch(() => null);
        }, UPDATE_CHECK_INTERVAL);

        notify();
        return registration;
    } catch (e) {
        console.error(e);
        return null;
    }
};
