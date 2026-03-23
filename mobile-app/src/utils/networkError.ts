import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { compactApiUrl, config } from '../config/env';

/** Chỉ host:port — tránh URL dài trong Alert bị xuống dòng nhìn như có dấu cách trong IP */
function apiHostPortLabel(): string {
  const u = compactApiUrl(config.API_URL).replace(/\s/g, '');
  try {
    const parsed = new URL(u);
    return parsed.host || u;
  } catch {
    return u.slice(0, 80);
  }
}

/** Thông báo rõ khi Axios báo Network Error */
export function formatAuthNetworkError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const noResponse = !err.response;
    const isNetwork =
      noResponse &&
      (err.code === 'ERR_NETWORK' ||
        err.message === 'Network Error' ||
        err.message?.includes('Network'));

    if (isNetwork) {
      const hostPort = apiHostPortLabel();
      // Không ghi tên biến .env quá dài — Alert hay xuống dòng giữa chừng (nhìn như "API _URL").
      const steps =
        `Không kết nối được tới ${hostPort} (mạng / máy chủ).\n\n` +
        `1) PC: chạy API (thư mục backend):\n` +
        `dotnet run --project VstepWritingLab.API\\VstepWritingLab.API.csproj --launch-profile http\n\n` +
        `2) Điện thoại mở trình duyệt: http://${hostPort}/api/health — phải thấy JSON (cùng Wi‑Fi, tắt VPN).\n\n` +
        `3) Firewall: cho phép TCP 5288 vào PC.\n\n` +
        `4) Sửa file mobile-app/.env — một dòng URL backend = IP máy tính (ipconfig → IPv4) + cổng 5288, không dấu cách thừa. ` +
        `Lưu file rồi: npx expo start --clear`;
      if (Platform.OS === 'android' && Constants.isDevice) {
        return steps;
      }
      if (Platform.OS === 'ios' && Constants.isDevice) {
        return steps + `\n\n(iPhone: không dùng localhost.)`;
      }
      return steps;
    }
    const raw = err.response?.data;
    if (typeof raw === 'string' && raw.trim()) return raw.trim().slice(0, 500);
    const data = raw as { message?: string; title?: string; detail?: string } | undefined;
    const apiMsg = data?.message ?? data?.title ?? data?.detail;
    if (apiMsg && String(apiMsg).trim()) return String(apiMsg).trim().slice(0, 500);
    const st = err.response?.status;
    if (st) return `Máy chủ trả lỗi HTTP ${st}. Kiểm tra backend và token Firebase.`;
  }
  if (err instanceof Error) return err.message;
  return 'Đăng nhập thất bại';
}
