// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { getAuth, signOut } from 'firebase/auth';
import { 
    addDoc, 
    collection, 
    doc,
    deleteDoc 
} from "firebase/firestore";
// Own libraries
import { db } from '../../../libs/firebase.js';
// Pages
import Home from './index.js';
// Context
import withFolders from '../../../providers/WithFolders.js';

const FirebasePageHome = ({folders}) => {
    const auth = getAuth();
    const createFolder = (folder) => {
        addDoc(collection(db, "folders"), folder);
    }

    const deleteFolder = (folderId) => {
        const docRef = doc(db, "folders", folderId);
        deleteDoc(docRef);
    }
    return <>
        <Home 
            createFolder={createFolder}
            deleteFolder={deleteFolder}
            folders={folders} 
            signOut={() => signOut(auth)} 
        />
    </>

}

FirebasePageHome.displayName = 'FirebasePageHome';
FirebasePageHome.propTypes = {
    folders: PropTypes.array,
}

export default withFolders(FirebasePageHome);