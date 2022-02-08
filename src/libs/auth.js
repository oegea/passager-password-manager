//Own libraries
import { db, fireStore, fireAuth } from './firebase.js';

const { doc, getDoc, setDoc} = fireStore;
const { getAuth, signOut } = fireAuth;

export const logout = () => {
    const auth = getAuth();
    signOut(auth);
    window.location.href = '/';
}

export const getUserDocument = async (user) => {
    if (user === null)
        return null;

    const {uid, email, displayName, photoURL} = user;

    // Retrieve current user document
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    // If exists, return
    if (docSnap.exists()) {
        return {uid, ...docSnap.data()};
    }

    // If not, create and return
    let userDocument = {
        email, displayName, photoURL
    };

    await updateUserDocument(uid, userDocument);
    return {uid, ...userDocument};
}

export const getUserPublicKey = async (user) => {
    if (user === null)
        return null;

    const docRef = doc(db, "userPublicKeys", user.uid);
    const docSnap = await getDoc(docRef);
    
    // If exists, return
    if (docSnap.exists()) {
        return docSnap.data().publicKey;
    }
    
    return '';
}

export const updateUserDocument = async (uid, userDocument) => {
    const initializedUserDocument = userDocumentFactory(userDocument);
    await setDoc(doc(db, "users", uid), {...initializedUserDocument});
};

export const updateUserPublicKey = async (uid, publicKey) => {
    await setDoc(doc(db, "userPublicKeys", uid), {publicKey});
};

export const userDocumentFactory = ({
    email, 
    displayName, 
    photoURL, 
    initialized = false,
    privateKey = ''
}) => {
    return { email, displayName, photoURL, initialized, privateKey };
}