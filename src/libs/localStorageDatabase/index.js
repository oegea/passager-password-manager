/**
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 *
 * Copyright (C) 2022 Oriol Egea Carvajal
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Formerly the @useful-tools/localstorage package (v1.2.0), now part of Passager.
// The storage layout must not change: existing local vaults live in it.

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
    }

    // Partial updates a document
    static updateDocument (collection, document, field, value) {

        const existentDocument = LocalStorageDatabase.searchDocument(collection, field, value);
        let finalDocument = existentDocument.length > 0 ? existentDocument[0] : {};
        finalDocument = {
            ...finalDocument,
            ...document
        };

        // Initialize uid
        if (finalDocument.id === undefined)
            finalDocument.id = LocalStorageDatabase.getRandomId();

        const data = LocalStorageDatabase.getCollection(collection);
        const filtered = data.filter(item => item[field] !== value);
        filtered.push(finalDocument);
        LocalStorageDatabase.setCollection(collection, filtered);

        return finalDocument;
    }

    // Adds a new document
    static createDocument(collection, document){
        const data = LocalStorageDatabase.getCollection(collection);
        document.id = LocalStorageDatabase.getRandomId();
        data.push(document);
        LocalStorageDatabase.setCollection(collection, data);

        return document;
    }

    // Deletes a document
    static deleteDocument (collection, field, value) {
        const data = LocalStorageDatabase.getCollection(collection);
        const filtered = data.filter(item => item[field] !== value);
        LocalStorageDatabase.setCollection(collection, filtered);

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
};
