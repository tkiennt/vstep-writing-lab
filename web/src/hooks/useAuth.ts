import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/userService';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile from backend
          const userProfile = await userService.getUserProfile(firebaseUser.uid);
          setUser({
            ...userProfile,
            email: firebaseUser.email || '',
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If we can't fetch profile, use basic info from Firebase
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            avatarUrl: firebaseUser.photoURL || undefined,
            targetLevel: 'B2', // Default level
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const requireAuth = (callback: () => void) => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    callback();
  };

  const handleLogout = async () => {
    try {
      await logout();
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
