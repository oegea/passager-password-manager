// Third party dependencies
import React from 'react';
// Own libs
import { signInWithGoogle } from '../../../libs/firebase';
// Pages
import Login from './index.js';

const FirebasePageLogin = () => {

    return <>
        <Login onGoogleLogin={signInWithGoogle}/>
    </>

}

FirebasePageLogin.displayName = 'FirebasePageLogin';

export default FirebasePageLogin;