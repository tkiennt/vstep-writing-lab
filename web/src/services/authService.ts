import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';
import api from './api';
import { LoginRequest, RegisterRequest, User, ApiResponse } from '@/types';

export const authService = {
  // Firebase Authentication
  async registerWithEmail(email: string, password: string, name: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
      
      // Save user to backend
      await api.post('/auth/register', {
        email,
        name,
        firebaseUid: userCredential.user.uid,
      });
    }
    
    return userCredential;
  },

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  // Backend user operations
  async getUserProfile(uid: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${uid}`);
    return response.data.data;
  },

  async updateUserProfile(uid: string, data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${uid}`, data);
    return response.data.data;
  },

  async setTargetLevel(uid: string, targetLevel: 'B1' | 'B2' | 'C1'): Promise<void> {
    await api.put(`/users/${uid}/target-level`, { targetLevel });
  },
};

// Convenience functions
export const login = async (credentials: LoginRequest) => {
  return await authService.loginWithEmail(credentials.email, credentials.password);
};

export const register = async (data: RegisterRequest) => {
  return await authService.registerWithEmail(data.email, data.password, data.name);
};

export const logout = async () => {
  return await authService.logout();
};
