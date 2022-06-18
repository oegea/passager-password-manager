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

// Default CSS 
import './index.css';
// Third party dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
// Routes
import Routes from './routes.js';
// Providers
import UserProvider from './providers/UserProvider.js';
import FoldersProvider from './providers/FoldersProvider.js';
// Own libs
import { initMobileSettings } from './libs/mobile.js';
// Config
import {i18nConfig} from './config/i18n.js';

//i18n initialization
i18n.use(initReactI18next).init(i18nConfig);

// Init things if we're running on mobile...
initMobileSettings();

ReactDOM.render(
  <React.StrictMode>
    <UserProvider>
      <FoldersProvider>
        <Routes />
      </FoldersProvider>
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
