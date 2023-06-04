import {useEffect} from 'react';
import { isBackendMode, isBackendFullyLogged, areBackendUrlsConfigured } from '../../../libs/backend.js';

export const useCheckBackendConfigAndRedirectEffect = () => {

    useEffect(() => {

        // If backend mode is not enabled, return to login page
        if (!isBackendMode()) {
            window.location.href = '/';
            return;
        }

        // If everything is fully configured, return to login page
        if (isBackendFullyLogged()) {
            window.location.href = '/';
            return;
        }

        // If backend urls have been configured, redirect to the next login stage
        if (areBackendUrlsConfigured()){
            window.location.href = '/login-backend';
            return;
        }

    }, []);

};