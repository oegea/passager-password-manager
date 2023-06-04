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
            console.log(data);
            return data;
        });
};