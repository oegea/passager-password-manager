export default class LocalStorageDatabase {

    static subscriptors = {};

    // Method to unsubscribe from changes in a local storage array
    static unsubscribeFromLocalStorage (collection, onSubscriptionChanges) {
        LocalStorageDatabase.subscriptors[collection] = LocalStorageDatabase.subscriptors[collection].filter(subscription => subscription !== onSubscriptionChanges);
    }

    // Method to subscribe to changes in a local storage array
    static subscribeToLocalStorage (collection, onSubscriptionChanges) {
        LocalStorageDatabase.subscriptors[collection] = LocalStorageDatabase.subscriptors[collection] || [];
        LocalStorageDatabase.subscriptors[collection].push(onSubscriptionChanges);

        // Schedule the first notification
        setTimeout(() => LocalStorageDatabase.notifySubscribersWithCurrentValue(collection), 0);
        
        // Return a function to unsubscribe
        return () => LocalStorageDatabase.unsubscribeFromLocalStorage(collection, onSubscriptionChanges);
        
    }

    // Method to notify subscribers of a specific collection
    static notifySubscribers (collection, value) {
        // Only if the subscriber list is an array
        if (Array.isArray(LocalStorageDatabase.subscriptors[collection])) {
            LocalStorageDatabase.subscriptors[collection].forEach(subscription => subscription(value));
        }
    }

    // Method to notify subscribers of a specific collection with the current value
    static notifySubscribersWithCurrentValue (collection) {
        const currentValue = LocalStorageDatabase.getCollection(collection);
        LocalStorageDatabase.notifySubscribers(collection, currentValue);
    }

    // Basic methods to save and get
    static setCollection (collection, value) {
        localStorage.setItem(collection, JSON.stringify(value));

        // Notify subscribers
        LocalStorageDatabase.notifySubscribers(collection, value);
    }

    // Gets all items from a collection
    static getCollection (collection) {
        const value = localStorage.getItem(collection);

        if (value === null)
            return [];

        return JSON.parse(value);
    }

    // Gets an item without initializing it
    static getItem(item){
        const value = localStorage.getItem(item);

        return JSON.parse(value);
    }

    // Method to filter in a local storage array
    static searchDocument (collection, field, value) {
        const data = LocalStorageDatabase.getCollection(collection);
        const filtered = data.filter(item => item[field] === value);
        return filtered;
    };

    // Method to save a document from a collection with an specific field
    static setDocument (collection, document, field, value) {
        const data = LocalStorageDatabase.getCollection(collection);

        // Initialize uid
        if (document.id === undefined)
            document.id = LocalStorageDatabase.getRandomId();
        
        // Remove existing document
        const filtered = data.filter(item => item[field] !== value);
        filtered.push(document);

        // Save the new data
        LocalStorageDatabase.setCollection(collection, filtered);

        // Notify subscriptors
        LocalStorageDatabase.notifySubscribers(collection, filtered);
    }

    // Partial updates a document
    static updateDocument (collection, document, field, value) {

        const existentDocument = LocalStorageDatabase.searchDocument(collection, field, value);
        let finalDocument = existentDocument.length > 0 ? existentDocument[0] : {};
        finalDocument = {
            ...finalDocument,
            ...document
        };

        const data = LocalStorageDatabase.getCollection(collection);
        const filtered = data.filter(item => item[field] !== value);
        filtered.push(finalDocument);
        LocalStorageDatabase.setCollection(collection, filtered);
        LocalStorageDatabase.notifySubscribers(collection, filtered);

        return finalDocument;
    }

    // Adds a new document
    static createDocument(collection, document){
        const data = LocalStorageDatabase.getCollection(collection);
        document.id = LocalStorageDatabase.getRandomId();
        data.push(document);
        LocalStorageDatabase.setCollection(collection, data);
        LocalStorageDatabase.notifySubscribers(collection, data);

        return document;
    }

    // Deletes a document
    static deleteDocument (collection, field, value) {
        const data = LocalStorageDatabase.getCollection(collection);
        const filtered = data.filter(item => item[field] !== value);
        LocalStorageDatabase.setCollection(collection, filtered);
        LocalStorageDatabase.notifySubscribers(collection, filtered);

        // Remove empty collections
        if (filtered.length === 0)
            LocalStorageDatabase.deleteCollection(collection);
    }

    // Deletes a collection
    static deleteCollection (collection) {
        localStorage.removeItem(collection);
    }

    static getRandomId() {
        const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
        return uint32.toString(16);
    }
}

export const  enableLocalMode = () => {
    localStorage.setItem('storeMode', 'LOCAL');
    // Refresh
    window.location.reload();
}