/**
 * hooks/useGradingAuth.ts
 * Thin auth hook for the grading features.
 * Adds signInWithGoogle + Firestore user upsert on top of the existing Firebase setup.
 *
 * Relies on lib/firebase.ts (env-var based singleton).
 * The existing hooks/useAuth.ts (email/password flow) is untouched.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UseGradingAuthReturn {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useGradingAuth(): UseGradingAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Subscribe to auth state ────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Upsert user document in Firestore ──────────────────────
  const upsertUserDoc = useCallback(async (firebaseUser: FirebaseUser) => {
    const ref = doc(db, 'users', firebaseUser.uid);
    await setDoc(
      ref,
      {
        displayName: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        role: 'student',
        lastActiveAt: serverTimestamp(),
      },
      { merge: true } // don't overwrite createdAt / isActive set by server
    );
  }, []);

  // ── Google sign-in ─────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      await upsertUserDoc(result.user);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        console.warn('[useGradingAuth] Popup blocked, falling back to redirect');
        import('firebase/auth').then(({ signInWithRedirect }) => {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          signInWithRedirect(auth, provider);
        });
      } else {
        console.error('[useGradingAuth] signInWithGoogle error:', error);
        throw error; // re-throw so UI can handle
      }
    }
  }, [upsertUserDoc]);

  // ── Sign out ───────────────────────────────────────────────
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[useGradingAuth] signOut error:', error);
      throw error;
    }
  }, []);

  return { user, loading, signInWithGoogle, signOut };
}
