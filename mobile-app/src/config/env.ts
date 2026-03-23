import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const firebase = (extra.firebase as Record<string, string>) ?? {};

/** Gỡ mọi khoảng (kể cả Unicode) — tránh "10.0.0 .1", "localhost: 5288" */
function stripInvisibleAndSpaces(s: string): string {
  let t = String(s).normalize('NFKC');
  try {
    t = t.replace(new RegExp('\\p{White_Space}', 'gu'), '');
  } catch {
    t = t.replace(/[\s\u00A0\uFEFF\u2000-\u200D\u2007\u202F\u205F\u2060\u3000]+/g, '');
  }
  return t.trim();
}

/** Gỡ khoảng quanh dấu chấm trong IPv4 (sau khi strip vẫn có thể sót ký tự lạ) */
function collapseIpv4Dots(s: string): string {
  return s.replace(/(\d)\s*\.\s*(\d)/g, '$1.$2');
}

/** Sửa nhầm ": 5288" → ":5288" (không đụng tới "://") */
function fixColonBeforePort(url: string): string {
  return url.replace(/:(\s+)(\d{2,5})(?=[/]|$)/g, ':$2');
}

/**
 * Ghép lại IPv4 nếu host bị lẫn khoảng/ký tự lạ (vd. 10.162.244 .130).
 * Không dùng `new URL()` vì chuỗi lỗi có thể throw.
 */
function rebuildIpv4Hostname(url: string): string {
  const m = url.match(/^(https?:\/\/)([^/?#]+)(.*)$/i);
  if (!m) return url;
  const proto = m[1];
  const authority = m[2];
  const rest = m[3];
  const hp = authority.match(/^([^:]+)(?::(\d+))?$/);
  if (!hp) return url;
  const hostPart = hp[1];
  const portNum = hp[2];
  const nums = hostPart.split(/[^0-9]+/).filter((x) => /^\d{1,3}$/.test(x));
  if (nums.length !== 4) return url;
  const host = `${nums[0]}.${nums[1]}.${nums[2]}.${nums[3]}`;
  const portStr = portNum ? `:${portNum}` : '';
  return `${proto}${host}${portStr}${rest}`;
}

/**
 * Chuẩn hóa URL cho request + hiển thị lỗi (gọi mọi nơi — tránh bundle cũ / .env lỗi hiện "localhost: 5288").
 */
export function compactApiUrl(u: string): string {
  let s = stripInvisibleAndSpaces(String(u));
  for (let i = 0; i < 4; i++) s = collapseIpv4Dots(s);
  s = fixColonBeforePort(s);
  s = rebuildIpv4Hostname(s);
  return s;
}

/**
 * Android emulator: localhost → 10.0.2.2 (host PC).
 * Android điện thoại thật: BẮT BUỘC EXPO_PUBLIC_API_URL=http://<IP_LAN_PC>:5288 (không dùng localhost).
 * iPhone thật: cũng phải dùng IP LAN, không dùng localhost.
 * Backend phải listen 0.0.0.0:5288 (đã cấu hình launchSettings).
 */
function resolveApiBaseUrl(): string {
  const raw =
    extra.apiUrl ??
    process.env.EXPO_PUBLIC_API_URL ??
    'http://localhost:5288';
  let url = stripInvisibleAndSpaces(String(raw));
  if (!url) url = 'http://localhost:5288';
  for (let i = 0; i < 4; i++) url = collapseIpv4Dots(url);
  url = fixColonBeforePort(url);
  url = rebuildIpv4Hostname(url);
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
const API_URL = compactApiUrl(`${API_BASE_URL}/api`);

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
