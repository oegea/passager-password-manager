import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const initMobileSettings = () => {
    StatusBar.hide();
}

export const isMobileDevice = () => {
    return Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
}