import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHsQ2ccGIPLsrRQg1bUr4f7cx8QTWPpiY",
  authDomain: "dearfutureme-62286.firebaseapp.com",
  projectId: "dearfutureme-62286",
  storageBucket: "dearfutureme-62286.firebasestorage.app",
  messagingSenderId: "603276206899",
  appId: "1:603276206899:web:cb9b2878146aaf88681446",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();
const firestore = getFirestore();

export { app, auth, storage, firestore };
