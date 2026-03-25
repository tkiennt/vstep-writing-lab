import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEPHGDf5nUhMkD4U3qinSpVdxoVpkdMfg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vstep-writing-lab.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vstep-writing-lab",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vstep-writing-lab.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "958279733063",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:958279733063:web:ef7e0d43d24ddf414b0662",
};

// Singleton pattern to prevent re-initialization error
let app: any;
if (getApps().length > 0) {
  app = getApp();
} else if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
} else {
  app = initializeApp({ apiKey: "none", projectId: "none" });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
