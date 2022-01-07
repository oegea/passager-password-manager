import React from 'react'
import { FoldersContext } from './FoldersProvider.js'

const getDisplayName = (WrappedComponent) => {
	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const withFolders = Component => {
	const WrappedComponent = props => {
		return (
			<FoldersContext.Consumer>
				{folders => <Component folders={folders} {...props}/>}
			</FoldersContext.Consumer>
		)
	}

	WrappedComponent.displayName = `WithFolders(${getDisplayName(WrappedComponent)})`

	return WrappedComponent;
}

export default withFolders;