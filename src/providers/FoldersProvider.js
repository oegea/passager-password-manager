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
	state = { folders: [], sharedFolders: [] };

	unsubscribeFromFolders = null;
	unsubscribeFromSharedFolders = null;

	componentDidMount = () => {
		this.subscribeToFolders();
		this.subscribeToSharedFolders();
	}

	componentDidUpdate = () => {
		this.subscribeToFolders();
		this.subscribeToSharedFolders();
	}
	
	componentWillUnmount = () => {
        if (this.unsubscribeFromFolders !== null)
		    this.unsubscribeFromFolders();
		
		if (this.unsubscribeFromSharedFolders !== null)
		    this.unsubscribeFromSharedFolders();
	}

	subscribeToFolders = async () => {
		const {user} = this.props;
		
		if (user === null || this.unsubscribeFromFolders !== null )
			return;

		this.unsubscribeFromFolders = await domain.useCases.folders['subscribe_to_folders_use_case'].execute({
			userId: user.uid,
			onSubscriptionChanges: (folders) => this.setState({folders})
		});
	}

	subscribeToSharedFolders = async () => {
		const {user} = this.props;
		
		if (user === null || this.unsubscribeFromSharedFolders !== null )
			return;

		this.unsubscribeFromSharedFolders = await domain.useCases.folders['subscribe_to_shared_folders_use_case'].execute({
			userId: user.uid,
			onSubscriptionChanges: (sharedFolders) => this.setState({sharedFolders})
		});
	}

	render() {
		const { folders, sharedFolders } = this.state;
		const { children } = this.props;

		return (
			<FoldersContext.Provider value={{
				folders, sharedFolders
			}}>{ children }</FoldersContext.Provider>
		);
	}

}

export default withUser(FoldersProvider);