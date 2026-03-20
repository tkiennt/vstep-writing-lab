'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

/**
 * Mounts a Firebase auth state listener once at the app root.
 * Keeps Zustand auth store and firebase-token cookie in sync on every page.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Refresh cookie so Next.js middleware can read it
          const token = await firebaseUser.getIdToken();
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            avatarUrl: firebaseUser.photoURL || undefined,
            targetLevel: 'B2',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch {
          setUser(null);
        }
      } else {
        // Clear cookie on sign-out
        document.cookie = 'firebase-token=; path=/; max-age=0; SameSite=Strict';
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, logout]);

  return <>{children}</>;
}
