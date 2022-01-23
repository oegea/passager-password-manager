// Third party dependencies
import React, { Component, createContext } from 'react';
import { collection, onSnapshot, where, query, limit } from "firebase/firestore";
// Own libraries
import { db, collectIdsAndDocs} from '../libs/firebase.js';
// Context
import withUser from '../providers/WithUser.js';

export const FoldersContext = createContext();

class FoldersProvider extends Component {
	state = { folders: [] };

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
		const {user} = this.props;
		
		if (user === null || this.unsubscribe !== null )
			return

		const q = query(collection(db, "folders"), where("owner", "==", user.uid), limit(10));
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            const folders = snapshot.docs.map(collectIdsAndDocs);
            this.setState({ folders });
        });
	}

	render() {
		const { folders } = this.state;
		const { children } = this.props;

		return (
			<FoldersContext.Provider value={folders}>{ children }</FoldersContext.Provider>
		);
	}

}

export default withUser(FoldersProvider);