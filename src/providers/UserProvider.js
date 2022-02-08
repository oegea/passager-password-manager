import React, { Component, createContext } from 'react';
import {auth} from '../libs/firebase.js';
import {getUserDocument, getUserPublicKey} from '../libs/auth.js';

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
			}

            this.setState({ user: userDocument });
        });
	};
	
	componentWillUnmount = () => {
		if (this.unsubscribe !== null)
			this.unsubscribe();
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