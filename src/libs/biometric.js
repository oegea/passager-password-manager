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

import { NativeBiometric } from 'capacitor-native-biometric';

const DOMAIN = 'im.oriol.passager';

export const loginWithCredentialsIfAvailable = async () => {
    const biometrics = await NativeBiometric.isAvailable();
    if (biometrics.isAvailable) {
        const credentials = await NativeBiometric.getCredentials({
            server: DOMAIN,
        });
        await NativeBiometric.verifyIdentity({
            reason: 'For easy log in',
            title: 'Log in to Passager',
            subtitle:
                'Access Passager without having to remember your master password',
            description: 'Please use a biometric device to identify yourself',
        });
        return credentials.password;
    }

    return null;
};

export const setCredentials = async (password) => {
    await NativeBiometric.setCredentials({
        username: '',
        password,
        server: DOMAIN,
    });
};
