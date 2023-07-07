/**
    MIT License

    Copyright (c) 2022 objektlabs.io

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */

import { Capacitor, WebView } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Http } from '@capacitor-community/http';
// --------------
// MODULE EXPORTS
// --------------
/**
 * CapacitorJS plugin to update the web contents of an app from a remote content server.
 *
 * @example
 * ```js
 * import { AppUpdater } from '@objekt/capacitor-app-updater';
 *
 * // Check for app updates on the remote content server.
 * const didUpdate = await AppUpdater.sync("https://your-web-server-url", 1000*60*60); // Only check once every 60 minutes.
 *
 * // Stop processing if there was an update, as the updated would have triggered a page reload.
 * if (didUpdate) {
 * 	return;
 * }
 *
 * // Load the app shell.
 * // ... e.g. await import('./src/AppShell.js');
 * ```
 */
export const AppUpdater = {
    /**
     * Syncs the online web app to the native app shell.
     *
     * Note: this function triggers a browser reload if the app was updated successfully to point to the new release.
     *
     * @param webServerURL - The URL of the online web server.
     * @param checkDelay - The amount of time to allow between update checks. Defaults to 60 minutes.
     *
     * @returns True, if the app was updated, otherwise false.
     */
    sync: async (webServerURL, checkDelay = 1000 * 60 * 60) => {
        // Do not run the sync job on non-native platforms. On Web the service worker will manage caching file instead.
        if (!Capacitor.isNativePlatform()) {
            return false;
        }
        // Start the app update job.
        const timeStart = new Date();
        console.log('AppUpdater: Starting...');
        try {
            // Get the currently installed release version.
            let activeRelease = await getCurrentRelease();
            // Check that enough time has elapsed before we can check for an update again.
            const lastUpdated = activeRelease.updated;
            const nextUpdateDue = new Date(lastUpdated.getTime() + checkDelay);
            if (new Date() < nextUpdateDue) {
                console.debug(`Last update was run at '${lastUpdated.toJSON()}'. Next update check only due at '${nextUpdateDue.toJSON()}'`);
                await  activateRelease(activeRelease.id);
                throw new Error('No need to check for updates yet.');
            }

            // Go online to check what the latest app release is.
            const manifest = await getServerManifest(webServerURL + '/version.manifest.json');
            if (!manifest) {
                console.debug('AppUpdater: No manifest found on server. Staying on current version.');
                await  activateRelease(activeRelease.id);
                throw new Error('Unable to get manifest from server');
            }
            // Check that latest release is not already installed.
            if (activeRelease.manifest.id === manifest.id) {
                // Nothing changed, reset the update check timestamp so that we don't check again unnecessarily.
                console.debug(`AppUpdater: Latest release already installed (${manifest.id}). Staying on current version.`);
                await activateRelease(activeRelease.id);
                throw new Error(`Latest release already installed (${manifest.id})`);
            }

            // Prepare to download a new release.
            await removeDir('releases', Directory.Data);
            await createDir('releases', Directory.Data);

            // Create the empty directory structure for each of the files in the new release package.
            const paths = [...new Set(manifest.files.map(file => file.substring(0, file.lastIndexOf('/'))))];
            for (const path of paths) {
                await createDir(`releases/${path}`, Directory.Data);
            }

            // Download the new release files from the web server.
            const downloadTasks = [];
            for (const file of manifest.files) {
                // Just download the file fresh from the web server.
                downloadTasks.push(downloadFileFromWebServer(`${webServerURL}/${file}`, `releases/${file}`, Directory.Data));
            }
            await Promise.all(downloadTasks);
            // Save the release manifest.
            await Filesystem.writeFile({
                path: 'releases/version.manifest.json',
                directory: Directory.Data,
                data: JSON.stringify(manifest),
                encoding: Encoding.UTF8,
                recursive: true
            });
            // Activate the downloaded release.
            await activateRelease(manifest.id);
            // Report that the app was successfully updated.
            return true;
        }
        catch (error) {
            console.log('AppUpdater: Error. Staying on current version??.\n\n', error);
            // Report that the app did not update.
            return false;
        }
        finally {
            console.log(`AppUpdater: Done in '${(new Date().getTime() - timeStart.getTime())}' milliseconds...`);
        }
    }
};
// --------------
// STEP FUNCTIONS
// --------------
/**
 * Get meta data for the currently installed app release.
 *
 * @returns The installed release details.
 */
async function getCurrentRelease() {
    console.debug('AppUpdater: Looking for current release.');
    try {
        const result = await Filesystem.readFile({
            path: 'version.json',
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
        if (result.data) {
            // Get the active release summary details.
            const data = JSON.parse(result.data);
            // Get the manifest for the active release.
            const manifest = JSON.parse((await Filesystem.readFile({
                path: 'releases/version.manifest.json',
                directory: Directory.Data,
                encoding: Encoding.UTF8
            })).data);
            // Return the release version details.
            console.debug(`AppUpdater: Found release version '${data.id}'`);
            return {
                id: data.id,
                updated: new Date(data.updated),
                manifest
            };
        }
    }
    catch (ignore) {
        console.debug('AppUpdater: Could not find "version.json", must be a new app install!');
        return {
            updated: new Date(0),
            manifest: {
                id: 'initial',
                files: []
            }
        };
    } 
    return null;
}

/**
 * Set the meta data for the currently installed app release.
 *
 * @param releaseName - The name to the new release.
 * @param timestamp - The timestamp on which the app was updated.
 */
async function setCurrentRelease(releaseName, timestamp = new Date()) {
    console.debug(`AppUpdater: App configured for release '${releaseName}'.`);
    // Update app release summary file.
    await Filesystem.writeFile({
        path: 'version.json',
        data: JSON.stringify({
            id: releaseName,
            updated: timestamp
        }),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true
    });
}

/**
 * Activates a downloaded app release package.
 *
 * @param releaseName - The name to the new release.
 */
async function activateRelease(releaseName) {
    console.debug(`AppUpdater: Reloading app to release '${releaseName}'.`);
    // Get the URI path to the app release directory.
    const releasePath = await Filesystem.getUri({
        path: 'releases',
        directory: Directory.Data
    });
    console.debug('PATHS COMPARISION');
    console.debug((await WebView.getServerBasePath()).path);
    console.debug(releasePath.uri);
    // Saves app release summary file.
    await setCurrentRelease(releaseName, new Date());
    // Point the app web view to the new release folder. only if current base path is different
    if ((await WebView.getServerBasePath()).path !== releasePath.uri) {
        await WebView.setServerBasePath({ path: releasePath.uri.replace('file://', '') });
    }

    // Ensure the new base path persists across sessions.
    // await WebView.persistServerBasePath();
    // console.debug('Persist web view base path');
}
// ----------------
// HELPER FUNCTIONS
// ----------------
/**
 * Downloads a manifest for a given web app.
 *
 * @param url - The url to the web app.
 *
 * @returns The web app manifest data.
 */
async function getServerManifest(url) {
    console.debug(`AppUpdater: Getting latest release manifest from '${url}'`);
    try {
        return (await Http.request({
            url: url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })).data;
    }
    catch (error) {
        console.debug('AppUpdater: Could not download and parse server manifest.\n\n', error);
    }
    return null;
}
/**
 * Copies a file from a previous release to a new release.
 *
 * @param fromPath - The path of the file to copy.
 * @param toPath - The path to copy the file to.
 * @param directory - The base directory to work in.
 */
async function copyFromPreviousRelease(fromPath, toPath, directory) {
    console.debug(`AppUpdater: Copy from previous release: '${fromPath}'`);
    await Filesystem.copy({
        from: fromPath,
        to: toPath,
        directory: directory
    });
}
/**
 * Downloads a file from the app web server to a given directory.
 *
 * @param url - The URL of the file to download.
 * @param path - The path to save the file to.
 * @param directory - The base directory to work in.
 *
 * @returns The file download result.
 */
async function downloadFileFromWebServer(url, path, directory) {
    console.debug(`AppUpdater: Download from Server: '${path}'`);
    return Http.downloadFile({
        url: url,
        method: 'GET',
        filePath: path,
        fileDirectory: directory,
        connectTimeout: 10 * 1000,
        readTimeout: 10 * 1000
    });
}

// -------------------
// FILE SYSTEM HELPERS
// -------------------
/**
 * Creates a new directory, ignoring warnings in case it already exists.
 *
 * @param path - The path of the directory to create.
 * @param directory - The base directory to work in.
 */
async function createDir(path, directory) {
    if (!path) {
        return;
    }
    console.debug(`AppUpdater: Creating '${path}' directory`);
    try {
        await Filesystem.mkdir({
            path: path,
            directory: directory,
            recursive: true
        });
    }
    catch (ignore) {
        console.debug(`AppUpdater: Directory '${path}' already exists`);
    }
}
/**
 * Deletes a new directory, ignoring warnings in case it has already been removed.
 *
 * @param path - The path of the directory to remove.
 * @param directory - The base directory to work in.
 */
async function removeDir(path, directory) {
    if (!path) {
        return;
    }
    console.debug(`AppUpdater: Removing '${path}' directory`);
    try {
        await Filesystem.rmdir({
            path: path,
            directory: directory,
            recursive: true
        });
    }
    catch (ignore) {
        console.debug(`AppUpdater: Directory '${path}' already removed`);
    }
}