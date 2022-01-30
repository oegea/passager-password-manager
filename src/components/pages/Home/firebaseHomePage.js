// Third party dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from "react-router-dom";
// Own libraries
import { db, fireStore, fireAuth } from '../../../libs/firebase.js';
// Pages
import Home from './index.js';
// Context
import withFolders from '../../../providers/WithFolders.js';
import withUser from '../../../providers/WithUser.js';

const FirebasePageHome = ({user, folders}) => {
    const { addDoc, collection, doc, deleteDoc } = fireStore;
    const { getAuth, signOut } = fireAuth;

    const {folderId} = useParams();

    const auth = getAuth();
    const createFolder = (folder) => {
        addDoc(collection(db, "folders"), {...folder, owner: user.uid});
    }

    const deleteFolder = (folderId) => {
        const docRef = doc(db, "folders", folderId);
        deleteDoc(docRef);
    }

    const createPassword = (folderId, password) => {
        const subcollectionRef = collection(db, "folders", folderId, "passwords");

        addDoc(subcollectionRef, {...password, owner: user.uid});
    }

    const logout = () => {
        signOut(auth);
        window.location.href = '/';
    }
    return <>
        <Home 
            createPassword={createPassword}
            createFolder={createFolder}
            deleteFolder={deleteFolder}
            folders={folders} 
            selectedFolder={folderId}
            signOut={() => logout()} 
        />
    </>

}

FirebasePageHome.displayName = 'FirebasePageHome';
FirebasePageHome.propTypes = {
    folders: PropTypes.array,
    user: PropTypes.object
}

export default withUser(withFolders(FirebasePageHome));