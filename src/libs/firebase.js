import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup,
  GoogleAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Basic configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsnpeBjPljXIp5TiNaa82U_m2Uy_Nm7kg",
  authDomain: "password-manager-afafa.firebaseapp.com",
  projectId: "password-manager-afafa",
  storageBucket: "password-manager-afafa.appspot.com",
  messagingSenderId: "181290555788",
  appId: "1:181290555788:web:5a98e33f72e4140e5d1ea9",
  measurementId: "G-85KWQX1XYK"
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