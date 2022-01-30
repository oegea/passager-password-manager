// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
// Own libraries
import { db, fireStore, fireAuth } from '../../../libs/firebase.js';
// Pages
import TableHome from './index.js';
// Context
import withFolders from '../../../providers/WithFolders.js';

const FirebaseTablePageHome = ({folders}) => {
    const { addDoc, collection } = fireStore;
    const { getAuth, signOut } = fireAuth;
    const auth = getAuth();
    const createFolder = (folder) => {

        // Add a new document with a generated id.
        addDoc(collection(db, "folders"), folder);
    }
    return <>
        <TableHome signOut={() => signOut(auth)} folders={folders} createFolder={createFolder}/>
    </>

}

FirebaseTablePageHome.displayName = 'FirebaseTablePageHome';
FirebaseTablePageHome.propTypes = {
    folders: PropTypes.array,
}

export default withFolders(FirebaseTablePageHome);