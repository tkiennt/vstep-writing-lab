import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBEPHGDf5nUhMkD4U3qinSpVdxoVpkdMfg",
  authDomain: "vstep-writing-lab.firebaseapp.com",
  projectId: "vstep-writing-lab",
  storageBucket: "vstep-writing-lab.firebasestorage.app",
  messagingSenderId: "958279733063",
  appId: "1:958279733063:web:ef7e0d43d24ddf414b0662",
  measurementId: "G-WE3WKSMRRR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
