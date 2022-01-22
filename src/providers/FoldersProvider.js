// Third party dependencies
import React, { Component, createContext } from 'react';
import { collection, onSnapshot, where, query } from "firebase/firestore";
// Own libraries
import { db, collectIdsAndDocs} from '../libs/firebase.js';
// Context
import withUser from '../providers/WithUser.js';

export const FoldersContext = createContext();

class FoldersProvider extends Component {
	state = { folders: [] };

	unsubscribe = null;

	componentDidMount = async () => {
		this._subscribe();
	};

	componentDidUpdate = () => {
		if (this.unsubscribe !== null)
			this.unsubscribe();

		this._subscribe();
	}
	
	componentWillUnmount = () => {
        if (this.unsubscribe !== null)
		    this.unsubscribe();
	}

	_subscribe = () => {
		const {user} = this.props;
		
		if (user === null)
			return
		
		const foldersRef = collection(db, "folders");
		const queryResult = query(foldersRef, where("owner", "==", user.uid));
        this.unsubscribe = onSnapshot(queryResult, (snapshot) => {
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