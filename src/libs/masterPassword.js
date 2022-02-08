// Own libraries
import { updateUserPublicKey, updateUserDocument } from "./auth.js";
import { createExportableRSAKeyPair } from "./crypto.js";


export const checkPassword = (password) => {
    let strengthValue = {
        'caps': false,
        'length': false,
        'special': false,
        'numbers': false,
        'small': false
    };

    if(password.length >= 8) {
        strengthValue.length = true;
    }

    if(password.match(/[A-Z]/)) {
        strengthValue.caps = true;
    }

    if(password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)) {
        strengthValue.special = true;
    }

    if(password.match(/[0-9]/)) {
        strengthValue.numbers = true;
    }

    if(password.match(/[a-z]/)) {
        strengthValue.small = true;
    }

    return strengthValue;
}

export const setUserMasterPassword = async (user, password) => {
    
    // Generate key pair
    const keyPair = await createExportableRSAKeyPair(password);

    // Store encrypted private key in user document
    const {uid} = user;
    const userDocument = {
        ...user,
        privateKey: keyPair.privateKey,
        initialized: true
    };
    await updateUserDocument(uid, userDocument);
    await updateUserPublicKey(uid, keyPair.publicKey);

    window.location.reload();
}