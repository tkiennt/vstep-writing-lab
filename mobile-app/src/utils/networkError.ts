import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { config } from '../config/env';

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
      const api = config.API_URL;
      if (Platform.OS === 'android' && Constants.isDevice) {
        return (
          `Không gọi được API (${api}). ` +
          `Điện thoại thật: trong mobile-app/.env đặt EXPO_PUBLIC_API_URL=http://<IP máy tính>:5288 ` +
          `(Windows: ipconfig → IPv4), cùng WiFi với PC, rồi restart Expo.`
        );
      }
      return (
        `Không gọi được API (${api}). ` +
        `Chạy backend (dotnet run --launch-profile http), kiểm tra Windows Firewall cho port 5288.`
      );
    }
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Đăng nhập thất bại';
}
