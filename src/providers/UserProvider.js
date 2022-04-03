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
import {auth} from '../libs/firebase.js';
import {getUserDocument, getUserPublicKey} from '../libs/auth.js';
import {importRSAKeyPair} from '../libs/crypto.js';

export const UserContext = createContext();

class UserProvider extends Component {
	state = { user: null };

	unsubscribe = null;
	logoutTimeout = null;

	ONE_MINUTE = 60 * 1000;
	TEN_MINUTES = 10 * this.ONE_MINUTE;
	LOGOUT_TIME = this.TEN_MINUTES;

	componentDidMount = async () => {

        this.unsubscribe = auth.onAuthStateChanged( async (user) => {
			let userDocument = null;
			if (user !== null) {
				userDocument = await getUserDocument(user);
				userDocument.publicKey = await getUserPublicKey(user);
				userDocument.decryptedPrivateKey = false;
				userDocument.decryptPrivateKey = this.decryptPrivateKey.bind(this);
			}

            this.setState({ user: userDocument });
        });

		document.body.addEventListener("click", () => this.resetLogoutTimeout());
		document.body.addEventListener("keydown", () => this.resetLogoutTimeout());
	};
	
	componentWillUnmount = () => {
		if (this.unsubscribe !== null)
			this.unsubscribe();
		
		if (this.logoutTimeout !== null)
			clearTimeout(this.logoutTimeout);

		document.body.removeEventListener("click", () => this.resetLogoutTimeout());
		document.body.removeEventListener("keydown", () => this.resetLogoutTimeout());
	}

	securityTimeout = () =>{ 
		const promise = new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, 2500);
		});
		return promise;
	}

	decryptPrivateKey = async (password) => {
		if (this.state.user === null || this.state.user.decryptedPrivateKey)
			return false;
		try {
			await this.securityTimeout();
			const keyPair = await importRSAKeyPair(this.state.user, password);
			this.setState({
				user: {
					...this.state.user, 
					encryptedPrivateKey: this.state.user.privateKey,
					privateKey: keyPair.privateKey, 
					publicKey: keyPair.publicKey, 
					decryptedPrivateKey: true
				}
			});
			
			this.logoutTimeout = setTimeout( () => this.loginTimeout(), this.LOGOUT_TIME);
			return true;
		}catch (e) {
			return false;
		}

	}

	resetLogoutTimeout() {
		if (this.logoutTimeout !== null){
			clearTimeout(this.logoutTimeout);
			this.logoutTimeout = setTimeout( () => this.loginTimeout(), this.LOGOUT_TIME);
		}
	}

	loginTimeout () {
		this.logoutTimeout = null;
		this.setState({ 
			user: {
				...this.state.user,
				privateKey: this.state.user.encryptedPrivateKey,
				decryptedPrivateKey: false
			}
		 });
	}

	render() {
		const { user } = this.state;
		const { children } = this.props;

		return (
			<UserContext.Provider value={user}>{ children }</UserContext.Provider>
		);
	}

}

export default UserProvider;