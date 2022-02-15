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