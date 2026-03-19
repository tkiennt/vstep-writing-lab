import { create } from 'zustand';
import { User } from '@/types';
import { UserDoc } from '@/lib/auth-sync';

interface AuthState {
  user: User | null;
  userDoc: UserDoc | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, userDoc?: UserDoc | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userDoc: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user, userDoc = null) => set({ 
    user, 
    userDoc,
    isAuthenticated: !!user,
    isLoading: false 
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ 
    user: null, 
    userDoc: null,
    isAuthenticated: false,
    isLoading: false 
  }),
}));
