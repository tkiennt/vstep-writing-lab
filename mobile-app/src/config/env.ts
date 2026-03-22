import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const firebase = (extra.firebase as Record<string, string>) ?? {};

/**
 * Android emulator: localhost → 10.0.2.2 (host PC).
 * Android điện thoại thật: BẮT BUỘC EXPO_PUBLIC_API_URL=http://<IP_LAN_PC>:5288 (không dùng localhost).
 * Backend phải listen 0.0.0.0:5288 (đã cấu hình launchSettings).
 */
function resolveApiBaseUrl(): string {
  const raw =
    extra.apiUrl ??
    process.env.EXPO_PUBLIC_API_URL ??
    'http://localhost:5288';
  // Gỡ mọi khoảng trắng (kể cả nhầm "10.0.0 .1") — nếu không, URL không hợp lệ → Axios ERR_NETWORK
  let url = String(raw).trim().replace(/\s/g, '');
  url = url.replace(/\/$/, '');

  // Chỉ khi Expo báo rõ isDevice === false mới là emulator.
  // Nếu isDevice là undefined (Expo Go trên máy thật), trước đây nhầm → 10.0.2.2 → không bao giờ tới được PC.
  const isAndroidEmulator = Constants.isDevice === false;

  if (
    Platform.OS === 'android' &&
    (url.includes('localhost') || url.includes('127.0.0.1'))
  ) {
    // Chỉ emulator dùng 10.0.2.2 — điện thoại thật không dùng được
    if (isAndroidEmulator) {
      try {
        const u = new URL(url);
        const port = u.port || '5288';
        return `http://10.0.2.2:${port}`;
      } catch {
        return 'http://10.0.2.2:5288';
      }
    }
    // Điện thoại thật mà .env vẫn localhost → không kết nối được; giữ URL để lỗi rõ ràng
  }
  return url;
}

const API_BASE_URL = resolveApiBaseUrl();
const API_URL = `${API_BASE_URL}/api`;

export const config = {
  API_BASE_URL,
  API_URL,
  firebase: {
    apiKey: firebase.apiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: firebase.authDomain ?? 'vstep-writing-lab.firebaseapp.com',
    projectId: firebase.projectId ?? 'vstep-writing-lab',
    storageBucket:
      firebase.storageBucket ?? 'vstep-writing-lab.firebasestorage.app',
    messagingSenderId: firebase.messagingSenderId ?? '',
    appId: firebase.appId ?? '',
  },
};
