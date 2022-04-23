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

// Third party dependencies
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider 
} from "firebase/auth";
import {
  addDoc, 
  collection, 
  deleteDoc,  
  doc,
  getDoc, 
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
// Config 
import { firebaseConfig } from "../config/firebase.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const provider = new GoogleAuthProvider()

export const collectIdsAndDocs = (doc) => {
  return { id: doc.id, ...doc.data() };
};

// Firestore wrapper
export const fireStore = {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
};

// Firebase Auth wrapper
export const fireAuth = {
  getAuth,
  signOut
}

export const auth = getAuth();
export const db = getFirestore();
export const  signInWithGoogle = () => {
  localStorage.setItem('storeMode', 'FIREBASE');
  signInWithPopup(auth, provider);
}

const defaultExport = {
  app,
  collectIdsAndDocs,
  db,
  fireStore
};

export default defaultExport;