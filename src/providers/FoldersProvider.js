// Third party dependencies
import React, { Component, createContext } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
// Own libraries
import { db, collectIdsAndDocs} from '../libs/firebase.js';

export const FoldersContext = createContext();

class FoldersProvider extends Component {
	state = { folders: [] };

	unsubscribe = null;

	componentDidMount = async () => {

        this.unsubscribe = onSnapshot(collection(db, "folders"), (snapshot) => {
            const folders = snapshot.docs.map(collectIdsAndDocs);
            this.setState({ folders });
        });
	};
	
	componentWillUnmount = () => {
        if (this.unsubscribe !== null)
		    this.unsubscribe();
	}

	render() {
		const { folders } = this.state;
		const { children } = this.props;

		return (
			<FoldersContext.Provider value={folders}>{ children }</FoldersContext.Provider>
		);
	}

}

export default FoldersProvider;