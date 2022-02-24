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
// Context
import withUser from '../providers/WithUser.js';
// Domain
import domain from '../domain/index.js';

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

	subscribe = async () => {
		const {user} = this.props;
		
		if (user === null || this.unsubscribe !== null )
			return;

		this.unsubscribe = await domain.useCases.folders['subscribe_to_folders_use_case'].execute({
			userId: user.uid,
			onSubscriptionChanges: (folders) => this.setState({folders})
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