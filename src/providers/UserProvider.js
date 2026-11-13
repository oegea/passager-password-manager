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

import React, { Component, createContext } from 'react';
import {
    getUserDocument,
    getUserPublicKey,
    isUserLoggedIn,
} from '../libs/auth.js';
import {
    decryptPrivateKey as decryptPrivateKeyWithPassword,
    importRSAPrivateKey,
    importRSAPublicKey,
    needsEncryptionUpgrade,
    upgradePrivateKeyEncryption,
} from '../libs/crypto/index.js';

// Domain
import domain from '../domain/index.js';
// Libs
import {
    readPrivateKeyFromLocalStorage,
    updateStoredPrivateKey,
} from '../libs/privateKey.js';
import {
    BiometricStaleError,
    declineBiometric,
    enrollBiometric,
    getBiometricAvailability,
    hasDeclinedBiometric,
    hasEnrollment,
    removeEnrollment,
    unlockWithBiometric,
} from '../libs/biometric.js';

export const UserContext = createContext();

class UserProvider extends Component {
    state = { user: null };

    unsubscribe = null;
    logoutTimeout = null;
    // Plain private key, kept in memory only while the "enable biometric
    // unlock" offer is on screen
    pendingPrivateKeyJwk = null;
    pendingPrivateKeyTimeout = null;

    ONE_MINUTE = 60 * 1000;
    TEN_MINUTES = 10 * this.ONE_MINUTE;
    LOGOUT_TIME = this.TEN_MINUTES;
    BIOMETRIC_OFFER_TIME = 2 * this.ONE_MINUTE;

    componentDidMount = async () => {
        if (isUserLoggedIn() === false) return;
        this.onSubscriptionChanges = async (user, onFinish) => {
            let userDocument = null;
            if (user !== null) {
                userDocument = await getUserDocument(user);
                userDocument.publicKey = await getUserPublicKey(user);
                userDocument.decryptedPrivateKey = false;
                userDocument.decryptPrivateKey =
                    this.decryptPrivateKey.bind(this);
                userDocument.reloadAuthDetails =
                    this.onSubscriptionChanges.bind(this, user);
                userDocument.unlockWithBiometric =
                    this.unlockWithBiometric.bind(this);
                userDocument.enableBiometric = this.enableBiometric.bind(this);
                userDocument.disableBiometric =
                    this.disableBiometric.bind(this);
                userDocument.dismissBiometricOffer =
                    this.dismissBiometricOffer.bind(this);
            }

            if (userDocument.privateKey.length === 0) {
                userDocument.isPrivateKeyStoredLocally = true;
                userDocument.privateKey =
                    readPrivateKeyFromLocalStorage(userDocument);
            } else {
                userDocument.isPrivateKeyStoredLocally = false;
            }

            userDocument.biometricAvailability = 'no';
            userDocument.biometricEnrolled = hasEnrollment(userDocument.uid);
            userDocument.biometricOffer = false;

            await this.asyncSetState({ user: userDocument });

            getBiometricAvailability().then((biometricAvailability) => {
                this.updateUser({ biometricAvailability });
            });
        };

        this.unsubscribe = await domain.useCases.users[
            'subscribe_to_auth_state_change_use_case'
        ].execute({
            onSubscriptionChanges: this.onSubscriptionChanges,
        });

        document.body.addEventListener('click', this.resetLogoutTimeout);
        document.body.addEventListener('keydown', this.resetLogoutTimeout);
    };

    asyncSetState = (state) => {
        return new Promise((resolve) => {
            this.setState(state, resolve);
        });
    };

    /** Merges some properties into the current user, if there is one. */
    updateUser = (properties) => {
        return new Promise((resolve) => {
            this.setState(
                (state) =>
                    state.user === null
                        ? null
                        : { user: { ...state.user, ...properties } },
                resolve
            );
        });
    };

    componentWillUnmount = () => {
        if (this.unsubscribe !== null) this.unsubscribe();

        if (this.logoutTimeout !== null) clearTimeout(this.logoutTimeout);
        this.clearPendingPrivateKey();

        document.body.removeEventListener('click', this.resetLogoutTimeout);
        document.body.removeEventListener('keydown', this.resetLogoutTimeout);
    };

    securityTimeout = () => {
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2500);
        });
        return promise;
    };

    clearPendingPrivateKey = () => {
        this.pendingPrivateKeyJwk = null;
        if (this.pendingPrivateKeyTimeout !== null) {
            clearTimeout(this.pendingPrivateKeyTimeout);
            this.pendingPrivateKeyTimeout = null;
        }
    };

    /**
     * Opens the session with the plain private key (JWK as a JSON string).
     */
    openSession = async (privateKeyJwk) => {
        const user = this.state.user;
        const privateKey = await importRSAPrivateKey(privateKeyJwk);
        const publicKey = await importRSAPublicKey(user.publicKey);

        await this.updateUser({
            nonParsedPublicKey: user.publicKey,
            encryptedPrivateKey: user.privateKey,
            privateKey,
            publicKey,
            decryptedPrivateKey: true,
        });

        if (this.logoutTimeout !== null) clearTimeout(this.logoutTimeout);
        this.logoutTimeout = setTimeout(
            () => this.loginTimeout(),
            this.LOGOUT_TIME
        );
    };

    decryptPrivateKey = async (password, withTimeout = true) => {
        if (this.state.user === null || this.state.user.decryptedPrivateKey)
            return false;
        try {
            if (withTimeout) await this.securityTimeout();
            const encryptedPrivateKey = this.state.user.privateKey;
            const privateKeyJwk = await decryptPrivateKeyWithPassword(
                encryptedPrivateKey,
                password
            );
            await this.openSession(privateKeyJwk);

            await this.offerBiometric(privateKeyJwk);
            // Not awaited: strengthening the encryption must never delay or
            // break the login
            this.upgradeKeyEncryption(encryptedPrivateKey, password);

            return true;
        } catch (e) {
            return false;
        }
    };

    // #region Encryption upgrade
    /**
     * Wraps the private key again with the current encryption version when
     * it was wrapped with an older one, and stores it. The key itself does
     * not change, and nothing shared with other users is affected.
     *
     * Clients older than this version can not read the new format: once an
     * account has been upgraded, they reject its master password.
     */
    upgradeKeyEncryption = async (encryptedPrivateKey, password) => {
        try {
            if (!needsEncryptionUpgrade(encryptedPrivateKey)) return false;

            const upgradedPrivateKey = await upgradePrivateKeyEncryption(
                encryptedPrivateKey,
                password
            );

            return await this.storeUpgradedPrivateKey(
                encryptedPrivateKey,
                upgradedPrivateKey
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    storeUpgradedPrivateKey = async (
        encryptedPrivateKey,
        upgradedPrivateKey
    ) => {
        const user = this.state.user;
        // Something else changed the key meanwhile: do nothing
        if (
            user === null ||
            !user.decryptedPrivateKey ||
            user.encryptedPrivateKey !== encryptedPrivateKey
        )
            return false;

        if (user.isPrivateKeyStoredLocally) {
            if (!updateStoredPrivateKey(upgradedPrivateKey, user.email))
                return false;
            if (readPrivateKeyFromLocalStorage(user) !== upgradedPrivateKey)
                return false;
        } else {
            await domain.useCases.users[
                'update_user_private_key_use_case'
            ].execute({
                email: user.email,
                privateKey: upgradedPrivateKey,
                uid: user.uid,
            });

            // Only trust what can be read back
            const storedUserDocument = await getUserDocument(user);
            if (
                !storedUserDocument ||
                storedUserDocument.privateKey !== upgradedPrivateKey
            )
                return false;
        }

        await this.updateUser({ encryptedPrivateKey: upgradedPrivateKey });
        return true;
    };
    // #endregion

    // #region Biometric unlock
    offerBiometric = async (privateKeyJwk) => {
        const user = this.state.user;
        if (
            user.biometricEnrolled ||
            hasDeclinedBiometric(user.uid) ||
            (await getBiometricAvailability()) !== 'yes'
        )
            return;

        this.clearPendingPrivateKey();
        this.pendingPrivateKeyJwk = privateKeyJwk;
        this.pendingPrivateKeyTimeout = setTimeout(
            () => this.dismissBiometricOffer(false),
            this.BIOMETRIC_OFFER_TIME
        );
        await this.updateUser({ biometricOffer: true });
    };

    dismissBiometricOffer = async (remember = false) => {
        this.clearPendingPrivateKey();
        if (remember && this.state.user !== null)
            declineBiometric(this.state.user.uid);
        await this.updateUser({ biometricOffer: false });
    };

    /**
     * Enables the biometric unlock in this device. Must be called from a
     * click. Uses the key kept for the offer, or the master password.
     */
    enableBiometric = async ({ password } = {}) => {
        const user = this.state.user;
        const pendingPrivateKeyJwk = this.pendingPrivateKeyJwk;
        const encryptedPrivateKey = user.decryptedPrivateKey
            ? user.encryptedPrivateKey
            : user.privateKey;

        try {
            await enrollBiometric({
                owner: user.uid,
                displayName: user.email || user.displayName,
                getPrivateKeyJwk: async () => {
                    if (pendingPrivateKeyJwk !== null)
                        return pendingPrivateKeyJwk;
                    const privateKeyJwk = await decryptPrivateKeyWithPassword(
                        encryptedPrivateKey,
                        password
                    );
                    await importRSAPrivateKey(privateKeyJwk);
                    return privateKeyJwk;
                },
            });
        } finally {
            this.clearPendingPrivateKey();
        }

        await this.updateUser({
            biometricEnrolled: true,
            biometricOffer: false,
        });
        return true;
    };

    disableBiometric = async () => {
        removeEnrollment();
        await this.updateUser({ biometricEnrolled: false });
    };

    unlockWithBiometric = async (signal) => {
        const user = this.state.user;
        if (user === null || user.decryptedPrivateKey) return false;
        try {
            const privateKeyJwk = await unlockWithBiometric(user.uid, signal);
            await this.openSession(privateKeyJwk);
            return true;
        } catch (e) {
            if (e instanceof BiometricStaleError) {
                // It can not open the vault anymore: forget it
                await this.disableBiometric();
            }
            throw e;
        }
    };
    // #endregion

    resetLogoutTimeout = () => {
        if (this.logoutTimeout !== null) {
            clearTimeout(this.logoutTimeout);
            this.logoutTimeout = setTimeout(
                () => this.loginTimeout(),
                this.LOGOUT_TIME
            );
        }
    };

    loginTimeout() {
        this.logoutTimeout = null;
        this.clearPendingPrivateKey();
        this.updateUser({
            publicKey: this.state.user.nonParsedPublicKey,
            privateKey: this.state.user.encryptedPrivateKey,
            decryptedPrivateKey: false,
            biometricOffer: false,
        });
    }

    render() {
        const { user } = this.state;
        const { children } = this.props;

        return (
            <UserContext.Provider value={user}>{children}</UserContext.Provider>
        );
    }
}

export default UserProvider;
