// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { getAuth, signOut } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
// Own libraries
import { db } from '../../../libs/firebase.js';
// Pages
import TableHome from './index.js';
// Context
import withFolders from '../../../providers/WithFolders.js';

const FirebaseTablePageHome = ({folders}) => {
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