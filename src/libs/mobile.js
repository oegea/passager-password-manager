import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const initMobileSettings = () => {
    StatusBar.hide();
}

export const isMobileDevice = () => {
    return Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
}

// Tricky thing: https://stackoverflow.com/questions/63304390/share-files-with-capacitor-share-plugin
export const writeFile = (fileName, data) => {
    const path = fileName;
    return Filesystem.writeFile({
      path,
      data,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    })
      .then(() => {
        return Filesystem.getUri({
          directory: Directory.Cache,
          path
        });
      })
      .then((uriResult) => {
        return Share.share({
          title: 'Passager Backup',
          url: uriResult.uri,
        });
      });
}