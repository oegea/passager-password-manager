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
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
// Pages
import ConfigureBackend from './components/pages/ConfigureBackend/index.js';
import Home from './components/pages/Home/index.js';
import Login from './components/pages/Login/index.js';
import LoginBackend from './components/pages/LoginBackend/index.js';
import Profile from './components/pages/Profile/index.js';
import ProfileBackups from './components/pages/Profile/backups.js';
import UserMasterPasswordValidation from './components/pages/UserMasterPasswordValidation/index.js';
import UserSignup from './components/pages/UserSignup/index.js';
import UserPrivateKeyValidation from './components/pages/UserPrivateKeyValidation/index.js';
import Privacy from './components/pages/Privacy/index.js';
// Context
import withUser from './providers/WithUser.js';
const RoutesConfiguration = ({ user }) => {
    console.log('user', user);
    return (
        <BrowserRouter>
            {user !== null &&
                user.initialized === true &&
                user.decryptedPrivateKey === false && 
                user.privateKey !== null && (
                <Routes>
                    <Route
                        path="*"
                        element={<UserMasterPasswordValidation />}
                    />
                </Routes>
            )}

            {user !== null &&
                user.initialized === true &&
                user.decryptedPrivateKey === false &&
                user.privateKey === null && (
                <Routes>
                    <Route
                        path="*"
                        element={<UserPrivateKeyValidation />}
                    />
                </Routes>
            )}

            {user !== null &&
                user.initialized === true &&
                user.decryptedPrivateKey === true && (
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/:folderId" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                        path="/profile/backups"
                        element={<ProfileBackups />}
                    />
                </Routes>
            )}

            {user !== null && !user.initialized && (
                <Routes>
                    <Route path="*" element={<UserSignup />} />
                </Routes>
            )}

            {user === null && (
                <Routes>
                    <Route path="*" element={<Login />} />
                    <Route path="/configure-backend" element={<ConfigureBackend />} />
                    <Route path="/login-backend" element={<LoginBackend />} />
                    <Route path="/privacy" element={<Privacy />} />
                </Routes>
            )}
        </BrowserRouter>
    );
};

RoutesConfiguration.displayName = 'Routes';
RoutesConfiguration.propTypes = {
    user: PropTypes.object,
};

export default withUser(RoutesConfiguration);
