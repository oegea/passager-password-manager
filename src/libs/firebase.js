import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup,
  GoogleAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Basic configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBT8hT33SyyZ8PSwoPHfdazfn86-eN6rs",
  authDomain: "passager-673da.firebaseapp.com",
  projectId: "passager-673da",
  storageBucket: "passager-673da.appspot.com",
  messagingSenderId: "573045151241",
  appId: "1:573045151241:web:8d91f688c3ffbf955e8ad8",
  measurementId: "G-Z4ZZG30YCS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const provider = new GoogleAuthProvider()

export const collectIdsAndDocs = (doc) => {
  return { id: doc.id, ...doc.data() };
};

export const auth = getAuth();
export const db = getFirestore();
export const  signInWithGoogle = () => signInWithPopup(auth, provider);
export default app;