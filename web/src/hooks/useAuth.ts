import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

function clearAuthCookie() {
  document.cookie = 'firebase-token=; path=/; max-age=0; SameSite=Strict';
}

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Refresh the cookie on every auth state change (e.g., page reload)
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
        } catch (error) {
          console.error('Error refreshing auth token:', error);
          setUser(null);
        }
      } else {
        clearAuthCookie();
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, logout]);

  const requireAuth = (callback: () => void) => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    callback();
  };

  const handleLogout = async () => {
    try {
      await authService.logout(); // Firebase signOut
      clearAuthCookie();
      logout(); // Zustand store clear
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
    logout: handleLogout,
  };
};
