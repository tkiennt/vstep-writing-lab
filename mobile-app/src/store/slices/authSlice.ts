import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { authService, UserDoc } from '../../services/authService';
import { auth } from '../../lib/firebase';
import { formatAuthNetworkError } from '../../utils/networkError';

/** Đợi Firebase khôi phục persistence — tránh auth.currentUser = null khi mở app. */
function waitForFirstAuthUser(): Promise<import('firebase/auth').User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

const TOKEN_KEY = '@vstep_token';
const USER_KEY = '@vstep_user';

export interface AuthState {
  user: UserDoc | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const cred = await authService.login(email, password);
      const token = await cred.user.getIdToken();
      const user = await authService.syncUser(token);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return { user, token };
    } catch (err: unknown) {
      return rejectWithValue(formatAuthNetworkError(err));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    {
      email,
      password,
      displayName,
    }: { email: string; password: string; displayName: string },
    { rejectWithValue }
  ) => {
    try {
      const cred = await authService.register(email, password, displayName);
      const token = await cred.user.getIdToken();
      const user = await authService.syncUser(token);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return { user, token };
    } catch (err: unknown) {
      return rejectWithValue(formatAuthNetworkError(err));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
});

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const firebaseUser = await waitForFirstAuthUser();
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        const synced = await authService.syncUser(token);
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(synced));
        return { user: synced, token };
      }
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      return rejectWithValue('No session');
    } catch {
      return rejectWithValue('Session expired');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Restore session
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
