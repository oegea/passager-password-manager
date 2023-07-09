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

// Third party dependencies
import React from 'react';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
// Libs
import {isBackendMode} from '../../../libs/backend.js';
// Vendor
import QRCode from 'react-qr-code';
import {printElementById} from '../../../vendor/print.js';

const UserDetailsRightPanel = ({ user }) => {
    const { t } = useTranslation();
    return (
        <>
            <SectionTitle title={t('profile.User details')} buttons={[]} />

            <p>
                <strong>{t('profile.Email')}: </strong>
                {user.email || '-'}
            </p>


            {!isBackendMode() && 
                <>
                    <SectionTitle title={'Increased security mode'} buttons={[]} />
                    <p>
                        Passager encrypts all your data before sending it to your organization servers (this include passwords, and any other sensible data you store in Passager). By doing this, you can be sure that only you and the people with whom you may have shared your folders, can have access to your data.
                    </p>
                    <p>
                        In order to achieve this high security level, Passager relies in two main components:
                    </p>
                    <ol>
                        <li>
                            The first one, is your user encryption key (also referred as &quot;private key&quot;). This key is randomly generated when you login for the first time, and it is the unique key that can decrypt your data. By default this key is managed by Passager, and is stored in your organization servers.
                        </li>
                        <li>
                            The second one, is your master password. It&apos;s a password you choose when you login for the first time, and it is used to encrypt your private key in order to ensure that nobody from your organization or any hypothetical attacker can read your private key, which will enable them to decrypt your information.
                        </li>
                    </ol>
                    <p>
                        This system guarantees the safety of your data, as long as your master password is strong-enough.
                    </p>
                    <p>
                        However, in case an additional level of security is required, you can opt to manage your user private key by yourself. This means that, once you enable this mode, your private key will no-longer be stored by your organization, and you will be in charge of storing it in a safe place.
                    </p>
                    <p>
                        As Passager needs your private key to work, you will need to provide it the first time you login on a new device. After logging in, your private key will be stored in your device and you will not be asked for it again unless you remove Passager&apos;s data, or you login on a new device.
                    </p>
                    <p>
                        Please note, the same way as your master password, you will not be able to recover your private key if you lose it. So, please, make sure you store it in a safe place <strong>or you can lose access to your data forever</strong>.
                    </p>
                    <p>
                        To help you store your private key, once you enable the advanced security mode, Passager will allow you to download and print an access kit, which will contain your private key splitted in two QR codes that you will be able to directly scan with your phone when you need to login on a new device.
                    </p>
                </>
            }

            {isBackendMode() && 
                <div>
                    <SectionTitle title={'Passager Access Kit'} buttons={[{
                        label: 'Print',
                        onClick: () => printElementById('access-kit', 'Passager Access Kit'),
                    }]}/> 
                    <div id="access-kit">
                        <p>
                            This is the access kit for <strong>{user.email || '-'}</strong>.
                        </p>
                        <p>
                            You will need to provide your user private key the first time you login on a new device. Please store this access kit on a safe place.
                        </p>
                        <p>
                            <strong>QR codes:</strong>
                        </p>
                        <p>
                            When accessing from a mobile phone, you can scan the following QR codes to provide your private key. Please scan them in the same order as they appear below (from left to right).
                        </p>
                        <div style={{border: '5px dashed #ccc', display: 'flex', justifyContent: 'space-around', padding: '20px'}}>
                            <QRCode value={user.encryptedPrivateKey.slice(0, user.encryptedPrivateKey.length / 2)} />

                            <QRCode value={user.encryptedPrivateKey.slice(user.encryptedPrivateKey.length / 2)} />
                        </div>

                        <p>
                            <strong>Private key:</strong>
                        </p>
                        <p>
                            If accessing Passager from a computer, you can directly copy and paste the following text:
                        </p>
                        <p style={{wordBreak: 'break-all', border: '5px dashed #ccc', padding: '20px'}}>
                            {user.encryptedPrivateKey}
                        </p>

                        <p>
                            <strong>Master password:</strong>
                        </p>
                        <p>
                            It is recommended to remember the master password and not to write it down anywhere. However, in case you need to write it down to ensure that you do not lose access to your account, you can use the following space once you have printed this access kit.
                        </p>

                        <div style={{border: '5px dashed #ccc', padding: '50px'}}>
                            
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

UserDetailsRightPanel.displayName = 'UserDetailsRightPanel';
UserDetailsRightPanel.propTypes = {};

export default withUser(UserDetailsRightPanel);
