import {logout} from './auth.js';

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

    if (isJwtTokenExpired(jwtToken)) {
        return false;
    }

    return true;
};

export const getServiceUrls = (baseUrl) => {

    const withHttpBaseUrl = (baseUrl.includes('http://') || baseUrl.includes('https://')) ? baseUrl : 'https://' + baseUrl;
    // Perform a get request to the baseUrl and make a console log of the response
    return fetch(withHttpBaseUrl + '/services-url')
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

// Common methods


export const setDocument = async (collection, document, findCriteria) => {
    // First check if document exists
    const searchResult = await findDocument(collection, findCriteria);

    // If document exists, update it
    if (searchResult !== null && searchResult.length > 0) {
        const existingDocument = searchResult[0];

        const updatedDocument = {
            ...document
        };

        const result = await updateDocument(
            collection,
            existingDocument.id,
            updatedDocument
        );

        return result;
    }

    // If document doesn't exist, create it
    const result = await createDocument(collection, document);

    return result;
};

export const setSubdocument = async (collection, parentId, subcollection, subdocument, findCriteria) => {
    // First check if document exists
    const searchResult = await findSubdocument(collection, parentId, subcollection, findCriteria);

    // If document exists, update it
    if (searchResult !== null && searchResult.length > 0) {
        const existingDocument = searchResult[0];

        const updatedDocument = {
            ...subdocument
        };

        const result = await updateSubdocument(
            collection,
            parentId,
            subcollection,
            existingDocument.id,
            updatedDocument
        );

        return result;
    }

    // If document doesn't exist, create it
    const result = await createSubdocument(collection, parentId, subcollection, subdocument);

    return result;
};

      

export const createDocument = async (collection, document) => {
    
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}`;
    const method = 'POST';
    const body = {
        ...document
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

export const createSubdocument = async (collection, parentId, subcollection, subdocument) => {

    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${parentId}/${subcollection}`;
    const method = 'POST';
    const body = {
        ...subdocument
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

export const updateDocument = async (collection, id, document) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${id}`;
    const method = 'PATCH';
    const body = {
        ...document
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

export const updateSubdocument = async (collection, parentId, subcollection, id, subdocument) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${parentId}/${subcollection}/${id}`;
    const method = 'PATCH';
    const body = {
        ...subdocument
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

export const getDocument = async (collection, id) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${id}`;
    const method = 'GET';

    const document = await queryDocumentsService(url, method, jwtToken);

    return document;
};

export const deleteDocument = async (collection, id) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${id}`;
    const method = 'DELETE';

    const document = await queryDocumentsService(url, method, jwtToken);

    return document;
};

export const deleteSubdocument = async (collection, parentId, subcollection, id) => {
    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${parentId}/${subcollection}/${id}`;
    const method = 'DELETE';

    const document = await queryDocumentsService(url, method, jwtToken);
    
    return document;
};

export const findDocument = async (collection, criteria) => {

    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/find`;
    const method = 'POST';
    const body = {
        ...criteria
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

export const findSubdocument = async (collection, parentId, subcollection, criteria) => {

    const serviceData = retrieveServiceData();

    if (serviceData === null) {
        return null;
    }

    const { documentsUrl, jwtToken } = serviceData;

    const url = `${documentsUrl}documents/${collection}/${parentId}/${subcollection}/find`;
    const method = 'POST';
    const body = {
        ...criteria
    };

    const documents = await queryDocumentsService(url, method, jwtToken, body);

    return documents;
};

const queryDocumentsService = async (url, method, jwtToken, body) => {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
        },
        body: method === 'GET' ? undefined : JSON.stringify(body),
    });

    const responseJson = await response.json();

    // If success prop is not true, return null
    if (responseJson?.success !== true) {
        return null;
    }

    return responseJson.message;
};

export const retrieveServiceData = () => {
    const documentsUrl = localStorage.getItem('documentsUrl');
    const jwtToken = localStorage.getItem('jwtToken');

    // If there is a missing parameter, return null
    if (documentsUrl === null || jwtToken === null) {
        return null;
    }

    // If jwt token is expired
    if (isJwtTokenExpired(jwtToken)) {
        return null;
    }

    const decodedJwtToken = decodeJwt(jwtToken);

    return {
        documentsUrl,
        jwtToken,
        decodedJwtToken
    };
};

const decodeJwt = (jwtToken) => {
    const base64Url = jwtToken.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jwtTokenDecoded = JSON.parse(window.atob(base64));
    return jwtTokenDecoded;
};

const isJwtTokenExpired = (jwtToken) => {
    const jwtTokenDecoded = decodeJwt(jwtToken);
    const expirationDate = new Date(jwtTokenDecoded.exp * 1000);
    const currentDate = new Date();
    if (currentDate > expirationDate) {
        logout();
        return true;
    }

    return false;
};