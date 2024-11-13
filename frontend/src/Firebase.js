import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzcrrDheV2rwfz8Z7JQenIvVtPUP4PV44",
  authDomain: "cse-beta-2250d.firebaseapp.com",
  projectId: "cse-beta-2250d",
  storageBucket: "cse-beta-2250d.appspot.com",
  messagingSenderId: "81645136701",
  appId: "1:81645136701:web:42e4f795824203849bf354",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();
const firestore = getFirestore();

export { app, auth, storage, firestore };
