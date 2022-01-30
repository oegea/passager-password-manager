//Own libraries
import { fireAuth } from './firebase.js';

const { getAuth, signOut } = fireAuth;

export const logout = () => {
    const auth = getAuth();
    signOut(auth);
    window.location.href = '/';
}