import { AppUpdater } from '../vendor/appUpdater.js';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';


export const initMobileSettings = async () => {
    StatusBar.hide();
    // Check for app updates - only if the app has not been launched in the last 60 minutes.
    const didUpdate = await AppUpdater.sync('https://cloud.passager.app', 1000*60*60);

    return didUpdate;
};

export const isMobileDevice = () => {
    return (
        Capacitor.getPlatform() === 'ios' ||
        Capacitor.getPlatform() === 'android'
    );
};

export const writeClipboard = (string) => {
    if (isMobileDevice()) {
        return Share.share({
            text: string
        });
    }

    return navigator.clipboard.writeText(string);
};

// Tricky thing: https://stackoverflow.com/questions/63304390/share-files-with-capacitor-share-plugin
export const writeFile = (fileName, data) => {
    const path = fileName;
    return Filesystem.writeFile({
        path,
        data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
    })
        .then(() => {
            return Filesystem.getUri({
                directory: Directory.Cache,
                path,
            });
        })
        .then((uriResult) => {
            return Share.share({
                title: fileName,
                url: uriResult.uri,
            });
        });
};
