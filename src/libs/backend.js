export const enableBackendMode = () => {
    localStorage.setItem('storeMode', 'BACKEND');
    window.location.href = '/configure-backend';
};

export const isBackendMode = () => {
    return localStorage.getItem('storeMode') === 'BACKEND';
};

export const areBackendUrlsConfigured = () =>{
    const documentsUrl = localStorage.getItem('documentsUrl');
    const authenticationUrl = localStorage.getItem('authenticationUrl');
    
    if (!documentsUrl || !authenticationUrl) {
        return false;
    }

    return true;
};

export const isBackendFullyLogged = () => {
    const jwtToken = localStorage.getItem('jwtToken');

    if (areBackendUrlsConfigured() === false || !jwtToken) {
        return false;
    }

    return true;
};

export const getServiceUrls = (baseUrl) => {
    // Perform a get request to the baseUrl and make a console log of the response
    return fetch(baseUrl + '/services-url')
        .then((response) => response.json())
        .then((data) => {
            if (data?.authenticationUrl && data?.documentsUrl) {
                return data;
            }

            return null;
            
        })
        .catch(() => null);
};

export const setServiceUrls = ({authenticationUrl, documentsUrl}) => {
    localStorage.setItem('authenticationUrl', authenticationUrl);
    localStorage.setItem('documentsUrl', documentsUrl);
    window.location.reload();
};

export const removeServiceUrls = () => {
    localStorage.removeItem('authenticationUrl');
    localStorage.removeItem('documentsUrl');
    window.location.reload();
};

export const startLoginProcess = (authenticationUrl, email) => {
    return fetch(authenticationUrl + 'login/' + email)
        .then((response) => response.json())
        .then((data) => {
            if (data?.success === true) {
                return true;
            }

            return false;
            
        })
        .catch(() => false);
};

export const finishLoginProcess = (authenticationUrl, email, token) => {
    return fetch(authenticationUrl + 'login/' + email + '/validate/' + token)
        .then((response) => response.json())
        .then((data) => {
            if (data?.success === true) {
                setJwtToken(data.message);
                return data?.message;
            }

            return false;
            
        })
        .catch(() => false);
};

export const setJwtToken = (jwtToken) => {
    localStorage.setItem('jwtToken', jwtToken);
    window.location.href = '/';
};