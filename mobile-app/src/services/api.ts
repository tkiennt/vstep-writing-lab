import axios, { AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { compactApiUrl, config } from '../config/env';
import { auth } from '../lib/firebase';
import { attachUserMessage } from '../utils/apiError';

const TOKEN_KEY = '@vstep_token';

type RetryConfig = InternalAxiosRequestConfig & { _retry401?: boolean };

/** Timeout mặc định; riêng chấm AI dùng timeout dài hơn trong `gradingService`. */
export const api: AxiosInstance = axios.create({
  baseURL: compactApiUrl(config.API_URL),
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

function getExistingAuthorization(
  headers: InternalAxiosRequestConfig['headers']
): string | undefined {
  if (!headers) return undefined;
  const h = headers as Record<string, string> & { get?: (k: string) => string };
  return h.Authorization ?? h.get?.('Authorization');
}

// Add Firebase token to requests (or stored token when restoring session)
api.interceptors.request.use(
  async (axiosConfig) => {
    // auth/sync gửi Bearer sẵn — không ghi đè (tránh race getIdToken vs token vừa đăng nhập)
    if (getExistingAuthorization(axiosConfig.headers)) {
      return axiosConfig;
    }
    let token: string | null = null;
    const user = auth.currentUser;
    if (user) {
      try {
        token = await user.getIdToken();
      } catch (_) {
        // ignore
      }
    }
    if (!token) {
      token = await AsyncStorage.getItem(TOKEN_KEY);
    }
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // 401 + body rỗng: thường do JWT hết hạn — thử làm mới token 1 lần (tránh vòng lặp)
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401 &&
      err.config &&
      !(err.config as RetryConfig)._retry401
    ) {
      const user = auth.currentUser;
      if (user) {
        (err.config as RetryConfig)._retry401 = true;
        try {
          const fresh = await user.getIdToken(true);
          await AsyncStorage.setItem(TOKEN_KEY, fresh);
          err.config.headers = err.config.headers ?? {};
          (err.config.headers as Record<string, string>)['Authorization'] =
            `Bearer ${fresh}`;
          return api.request(err.config);
        } catch {
          /* reject below */
        }
      }
    }

    attachUserMessage(err);
    return Promise.reject(err);
  }
);
