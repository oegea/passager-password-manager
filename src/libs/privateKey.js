export const createFragment = ({
    content,
    ownerIdentifier,
    totalFragments,
    fragmentNumber,
}) => {
    // Calculate length of each fragment
    const fragmentLength = Math.ceil(content.length / totalFragments);
    // Calculate the latest fragment finish
    const lastFragmentFinish = (fragmentNumber - 1) * fragmentLength;
    // Get the desired fragment
    const fragmentContent = content.slice(
        lastFragmentFinish,
        lastFragmentFinish + fragmentLength
    );
    // Create the fragment
    return {
        ownerIdentifier,
        totalFragments,
        fragmentNumber,
        fragmentContent,
    };
};

export const createExportableFragment = ({
    content,
    ownerIdentifier,
    totalFragments,
    fragmentNumber,
}) => {
    return JSON.stringify(
        createFragment({
            content,
            ownerIdentifier,
            totalFragments,
            fragmentNumber,
        })
    );
};

export const readPrivateKeyFromLocalStorage = (currentUser) => {
    try {
        const storedUserKey = JSON.parse(
            localStorage.getItem('privateUserKey')
        );

        if (
            storedUserKey === null ||
            storedUserKey.owner !== currentUser.email
        ) {
            return null;
        } else {
            return storedUserKey.privateKey;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const storePrivateKey = (privateKey, userEmail) => {
    try {
        const privateKeyObject = {
            owner: userEmail,
            privateKey,
        };

        localStorage.setItem(
            'privateUserKey',
            JSON.stringify(privateKeyObject)
        );

        document.location.reload();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * Replaces the private key stored in this device without reloading the app.
 * Used when the key is wrapped again with a stronger encryption version.
 */
export const updateStoredPrivateKey = (privateKey, userEmail) => {
    try {
        localStorage.setItem(
            'privateUserKey',
            JSON.stringify({ owner: userEmail, privateKey })
        );
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const getPrivateKeyFragment = (fragment) => {
    try {
        return JSON.parse(fragment);
    } catch (error) {
        console.error(error);
        return null;
    }
};
