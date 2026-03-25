/**
 * lib/firebase.ts
 * Singleton Firebase initialization — reads from env vars.
 * Used by all NEW grading features (lib/api, lib/firestore, hooks/useGradingAuth).
 *
 * The legacy services/firebase.ts (hardcoded config) is kept unchanged
 * to avoid breaking existing auth / admin flows.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton guard — reuse existing app if already initialised
let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApp();
} else if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
} else {
  // Fallback for SSR/Build when ENV is missing
  app = initializeApp({ apiKey: "none", projectId: "none" }); 
}

export const auth: Auth = getAuth(app);

// Prevent sticky accounts during dev by forcing session persistence
if (typeof window !== 'undefined') {
  setPersistence(auth, browserSessionPersistence).catch(console.error);
}

export const db: Firestore = getFirestore(app);

export default app;
