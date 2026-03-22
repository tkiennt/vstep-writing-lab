import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to wait for Firebase auth to initialize
const getAuthToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        const token = await user.getIdToken();
        resolve(token);
      } else {
        resolve(null);
      }
    });
  });
};

// Add interceptor to include Firebase token
api.interceptors.request.use(async (config) => {
  try {
    // Try current user first (fastest)
    let token = null;
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    } else {
      // If no current user, wait a bit for initialization
      token = await getAuthToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('API Request Made without Authentication: No Firebase User found.');
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

export default api;
