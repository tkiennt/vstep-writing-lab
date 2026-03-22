import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth, type Persistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/env';

const firebaseConfig = config.firebase;

if (!firebaseConfig.apiKey?.trim() || !firebaseConfig.appId?.trim()) {
  console.warn(
    '[firebase] Thiếu EXPO_PUBLIC_FIREBASE_API_KEY hoặc EXPO_PUBLIC_FIREBASE_APP_ID trong .env — Auth có thể lỗi.'
  );
}

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** RN: Metro resolve `@firebase/auth` → `dist/rn` — typings chính không export `getReactNativePersistence`. */
function getAuthWithPersistence(): Auth {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require('@firebase/auth') as {
      getReactNativePersistence: (storage: typeof ReactNativeAsyncStorage) => Persistence;
    };
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = getAuthWithPersistence();
export default app;
