/**
 * lib/firebase.ts
 * Singleton Firebase initialization — reads from env vars.
 * Used by all NEW grading features (lib/api, lib/firestore, hooks/useGradingAuth).
 *
 * The legacy services/firebase.ts (hardcoded config) is kept unchanged
 * to avoid breaking existing auth / admin flows.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEPHGDf5nUhMkD4U3qinSpVdxoVpkdMfg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vstep-writing-lab.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vstep-writing-lab",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vstep-writing-lab.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "958279733063",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:958279733063:web:ef7e0d43d24ddf414b0662",
};

// Singleton guard — reuse existing app if already initialised
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
