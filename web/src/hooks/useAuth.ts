import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onIdTokenChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { syncUser } from '@/lib/auth-sync';

function clearAuthCookie() {
  document.cookie = 'firebase-token=; path=/; max-age=0; SameSite=Strict';
}

export const useAuth = () => {
  const router = useRouter();
  const { user, userDoc, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // Only show global loading if we don't have a user yet
      if (!isAuthenticated) {
        setLoading(true);
      }

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          document.cookie = `firebase-token=${token}; path=/; SameSite=Strict`;

          // Sync with backend (non-blocking if we already have a user)
          const doc = await syncUser(firebaseUser);

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: doc.displayName || firebaseUser.displayName || '',
            avatarUrl: doc.avatarUrl || firebaseUser.photoURL || undefined,
            targetLevel: (doc.targetLevel as any) || 'B2',
            createdAt: new Date(),
            updatedAt: new Date(),
          }, doc);

        } catch (error: any) {
          console.error('Error syncing user:', error);
          // If it's a timeout or network error, and we already have a user, just log it
          if (isAuthenticated) {
            console.warn('Background sync failed, keeping current session');
          } else {
            alert(`Lỗi đồng bộ tài khoản: ${error.message || 'Vui lòng thử lại sau.'}`);
            setUser(null, null);
          }
        }
      } else {
        clearAuthCookie();
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, logout, isAuthenticated]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // onIdTokenChanged will handle the rest
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      clearAuthCookie();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    userDoc,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout: handleLogout,
  };
};
