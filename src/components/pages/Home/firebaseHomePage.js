// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { getAuth, signOut } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
// Own libraries
import { db } from '../../../libs/firebase.js';
// Pages
import Home from './index.js';
// Context
import withFolders from '../../../providers/WithFolders.js';

const FirebasePageHome = ({folders}) => {
    const auth = getAuth();
    const createFolder = (folder) => {

        // Add a new document with a generated id.
        addDoc(collection(db, "folders"), folder);
    }
    return <>
        <Home signOut={() => signOut(auth)} folders={folders} createFolder={createFolder}/>
    </>

}

FirebasePageHome.displayName = 'FirebasePageHome';
FirebasePageHome.propTypes = {
    folders: PropTypes.array,
}

export default withFolders(FirebasePageHome);