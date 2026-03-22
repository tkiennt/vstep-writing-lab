import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api } from './api';

export interface UserDoc {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  onboardingCompleted: boolean;
  currentLevel?: string;
  targetLevel?: string;
  isNewUser: boolean;
}

export const authService = {
  async register(email: string, password: string, displayName: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  },

  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async logout(): Promise<void> {
    return signOut(auth);
  },

  async forgotPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  async syncUser(token?: string): Promise<UserDoc> {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : undefined;
    const { data } = await api.post<UserDoc>('/auth/sync', null, { headers });
    return data;
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};
