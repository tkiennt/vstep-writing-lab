import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Firebase token
api.interceptors.request.use(async (config) => {
  // Logic to get token from firebase auth and attach to headers would go here
  // const token = await auth.currentUser?.getIdToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
