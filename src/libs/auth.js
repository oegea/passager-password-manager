//Own libraries
import { db, fireStore, fireAuth } from './firebase.js';

// const { addDoc, collection, doc, deleteDoc, limit, query, getDocs, writeBatch } = fireStore;
const {doc, getDoc, setDoc} = fireStore;
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
    let userDocument = userDocumentFactory({
        email, displayName, photoURL
    });

    await updateUserDocument(uid, userDocument);
    return {uid, ...userDocument};
}

export const updateUserDocument = async (uid, userDocument) => {
    await setDoc(doc(db, "users", uid), {...userDocument});
};

export const userDocumentFactory = ({
    email, 
    displayName, 
    photoURL, 
    initialized = false,
    publicKey = '',
    privateKey = ''
}) => {
    return { email, displayName, photoURL, initialized, publicKey, privateKey };
}