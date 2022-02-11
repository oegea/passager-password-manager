import React, { Component, createContext } from 'react';
import {auth} from '../libs/firebase.js';
import {getUserDocument, getUserPublicKey} from '../libs/auth.js';
import {importRSAKeyPair} from '../libs/crypto.js';

export const UserContext = createContext();

class UserProvider extends Component {
	state = { user: null };

	unsubscribe = null;

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
	};
	
	componentWillUnmount = () => {
		if (this.unsubscribe !== null)
			this.unsubscribe();
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
					privateKey: keyPair.privateKey, 
					publicKey: keyPair.publicKey, 
					decryptedPrivateKey: true
				}
			});
			return true;
		}catch (e) {
			return false;
		}

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