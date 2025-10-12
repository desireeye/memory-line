// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2MjeuErEPs9LqOwQ3tK3aWbYlict-e0A",
  authDomain: "memorylineapp-e5db1.firebaseapp.com",
  projectId: "memorylineapp-e5db1",
  storageBucket: "memorylineapp-e5db1.appspot.com",
  messagingSenderId: "558944601283",
  appId: "1:558944601283:web:9dc528f42f9b2537524e76"
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing required fields');
  throw new Error('Firebase configuration is invalid');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

const logout = () => signOut(auth);

export {
  auth,
  db,
  storage,
  signInWithGoogle,
  logout,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};