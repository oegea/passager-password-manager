// Third party dependencies
import React, { Component, createContext } from 'react';
import { collection, onSnapshot, where, query, limit } from "firebase/firestore";
// Own libraries
import { db, collectIdsAndDocs} from '../libs/firebase.js';
// Context
import withUser from '../providers/WithUser.js';

export const PasswordsContext = createContext();

class PasswordsProvider extends Component {
	state = { passwords: [] };

	unsubscribe = null;

	componentDidMount = () => {
		this.subscribe();
	}

	componentDidUpdate = () => {
		this.subscribe();
	}
	
	componentWillUnmount = () => {
        if (this.unsubscribe !== null)
		    this.unsubscribe();
	}

	subscribe = () => {
		const {user, folderId} = this.props;
		
		if (user === null || this.unsubscribe !== null)
			return

        const collectionRef = collection(db, "folders", folderId, "passwords");
		const q = query(collectionRef, where("owner", "==", user.uid), limit(10));
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            const passwords = snapshot.docs.map(collectIdsAndDocs);
            this.setState({ passwords });
        });
	}

	render() {
		const { passwords } = this.state;
		const { children } = this.props;

		return (
			<PasswordsContext.Provider value={passwords}>{ children }</PasswordsContext.Provider>
		);
	}

}

export default withUser(PasswordsProvider);