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

    // Basic methods to save and get
    static saveCollection (collection, value) {
        localStorage.setItem(collection, JSON.stringify(value));

        // Notify subscribers
        LocalStorageDatabase.notifySubscribers(collection, value);
    }

    // Gets all items from a collection
    static getCollection (collection) {
        return JSON.parse(localStorage.getItem(collection));
    }

    // Method to filter in a local storage array
    static searchDocument (collection, field, value) {
        const data = LocalStorageDatabase.getCollection(collection);
        const filtered = data.filter(item => item[field] === value);
        return filtered;
    };

    // Method to save a document from a collection with an specific field
    static saveDocumentToLocalStorage (collection, document, field, value) {
        const data = LocalStorageDatabase.getCollection(collection);
        
        // Remove existing document
        const filtered = data.filter(item => item[field] !== value);
        filtered.push(document);

        // Save the new data
        LocalStorageDatabase.saveCollection(collection, filtered);

        // Notify subscriptors
        LocalStorageDatabase.notifySubscribers(collection, filtered);
    }
}

export const  enableLocalMode = () => localStorage.setItem('storeMode', 'LOCAL');