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
import {createExportableFragment} from '../../../libs/privateKey.js';
import {storePrivateKey} from '../../../libs/privateKey.js';
// Vendor
import QRCode from 'react-qr-code';
import {printElementById} from '../../../vendor/print.js';
// Domain
import domain from '../../../domain/index.js';

const UserDetailsRightPanel = ({ user }) => {
    const { t } = useTranslation();

    return (
        <>
            <SectionTitle title={t('profile.User details')} buttons={[]} />

            <p>
                <strong>{t('profile.Email')}: </strong>
                {user.email || '-'}
            </p>


            {isBackendMode() && user.isPrivateKeyStoredLocally === false && 
                <>
                    <SectionTitle title={t('profile.Increased security mode')} buttons={[{
                        label: t('common.Enable'),
                        onClick: () => {

                            domain.useCases.users[
                                'update_user_private_key_use_case'
                            ].execute({
                                email: user.email,
                                privateKey: '',
                                uid: user.uid
                            }).then(() => {
                                storePrivateKey(user.encryptedPrivateKey, user.email);
                            });
                        },
                    }]} />
                    <p>
                        {t('profile.Passager encrypts all your data before sending it to your organization servers (this include passwords, and any other sensible data you store in Passager). By doing this, you can be sure that only you and the people with whom you may have shared your folders, can have access to your data')}
                    </p>
                    <p>
                        {t('profile.In order to achieve this high security level, Passager relies in two main components:')}
                    </p>
                    <ol>
                        <li>
                            {t('profile.The first one, is your user encryption key (also referred as &quot;private key&quot;). This key is randomly generated when you login for the first time, and it is the unique key that can decrypt your data. By default this key is managed by Passager, and is stored in your organization servers')}
                        </li>
                        <li>
                            {t('profile.The second one, is your master password. It&apos;s a password you choose when you login for the first time, and it is used to encrypt your private key in order to ensure that nobody from your organization or any hypothetical attacker can read your private key, which will enable them to decrypt your information')}
                        </li>
                    </ol>
                    <p>
                        {t('profile.This system guarantees the safety of your data, as long as your master password is strong-enough')}
                    </p>
                    <p>
                        {t('profile.However, in case an additional level of security is required, you can opt to manage your user private key by yourself. This means that, once you enable this mode, your private key will no-longer be stored by your organization, and you will be in charge of storing it in a safe place')}
                    </p>
                    <p>
                        {t('profile.As Passager needs your private key to work, you will need to provide it the first time you login on a new device. After logging in, your private key will be stored in your device and you will not be asked for it again unless you remove Passager&apos;s data, or you login on a new device')}
                    </p>
                    <p>
                        {t('profile.Please note, the same way as your master password, you will not be able to recover your private key if you lose it. So, please, make sure you store it in a safe place')} <strong>{t('profile.or you can lose access to your data forever')}</strong>
                    </p>
                    <p>
                        {t('profile.To help you store your private key, once you enable the advanced security mode, Passager will allow you to download and print an access kit, which will contain your private key splitted in two QR codes that you will be able to directly scan with your phone when you need to login on a new device')}
                    </p>
                </>
            }

            {isBackendMode() && user.isPrivateKeyStoredLocally && 
                <div>
                    <SectionTitle title={t('profile.Increased security mode')} buttons={[{
                        label: t('profile.Print access kit'),
                        onClick: () => printElementById('access-kit', t('profile.Passager access kit')),
                    }, {
                        label: t('profile.Disable improved security mode'),
                        onClick: () => {
                            domain.useCases.users[
                                'update_user_private_key_use_case'
                            ].execute({
                                email: user.email,
                                privateKey: user.encryptedPrivateKey,
                                uid: user.uid
                            }).then(() => {
                                document.location.reload();
                            });
                        },
                    }]}/> 
                    <p>
                        {t('profile.The improved security mode is enabled. You will need to provide your private key when logging in on a new device')}
                    </p>
                    <p>
                        {t('profile.Please download and print your access kit to be sure you do not lose access to your data')}
                    </p>
                    <div style={{'display': 'none'}}>
                        <div id="access-kit">
                            <p>
                                {t('profile.This access kit belongs to')} <strong>{user.email || '-'}</strong> ({localStorage.getItem('documentsUrl')}).
                            </p>
                            <p>
                                {t('profile.You will need your user private key when logging in on a new device. Store this document on a safe place')}
                            </p>
                            <p>
                                <strong>{t('profile.QR codes')}:</strong>
                            </p>
                            <p>
                                {t('profile.When accessing from a mobile phone, you can scan the following QR codes to provide your private key')}
                            </p>
                            <div style={{border: '5px dashed #ccc'}}>
                                <div style={{display: 'flex', justifyContent: 'space-around', padding: '20px'}}>
                                    <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '10px', 'textAlign': 'center', 'fontWeight': 'bold'}}>
                                        <QRCode value={createExportableFragment({
                                            content: user.encryptedPrivateKey, 
                                            ownerIdentifier: user.email, 
                                            totalFragments: 4, 
                                            fragmentNumber: 1
                                        })} />
                                        {t('profile.QR number')} 1
                                    </div>

                                    <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '10px', 'textAlign': 'center', 'fontWeight': 'bold'}}>
                                        <QRCode value={createExportableFragment({
                                            content: user.encryptedPrivateKey, 
                                            ownerIdentifier: user.email, 
                                            totalFragments: 4, 
                                            fragmentNumber: 2
                                        })} />
                                        {t('profile.QR number')} 2
                                    </div>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-around', padding: '20px'}}>
                                    <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '10px', 'textAlign': 'center', 'fontWeight': 'bold'}}>
                                        <QRCode value={createExportableFragment({
                                            content: user.encryptedPrivateKey, 
                                            ownerIdentifier: user.email, 
                                            totalFragments: 4, 
                                            fragmentNumber: 3
                                        })} />
                                        {t('profile.QR number')} 3
                                    </div>
                                    <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '10px', 'textAlign': 'center', 'fontWeight': 'bold'}}>
                                        <QRCode value={createExportableFragment({
                                            content: user.encryptedPrivateKey, 
                                            ownerIdentifier: user.email, 
                                            totalFragments: 4, 
                                            fragmentNumber: 4
                                        })} />
                                        {t('profile.QR number')} 4
                                    </div>
                                </div>
                            </div>

                            <p>
                                <strong>{t('profile.Master password')}:</strong>
                            </p>
                            <p>
                                {t('profile.It is recommended to remember the master password and not writting it down anywhere. However, in case you feel more comfortable writting it down, you can do it here:')}
                            </p>

                            <div style={{border: '5px dashed #ccc', padding: '25px'}}>
                                
                            </div>

                            <h1>{t('profile.Private key')}</h1>
                            <p>
                                {t('profile.If you prefer to not print this file, you can directly copy and paste the following text. In case of printing this document (which is recommended), you can skip this page')}
                            </p>
                            <p style={{wordBreak: 'break-all', border: '5px dashed #ccc', padding: '20px', fontSize: '12px'}}>
                                {user.encryptedPrivateKey}
                            </p>
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
