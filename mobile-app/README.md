# VSTEP Writing Lab - Mobile App

React Native Expo app cho luyện viết VSTEP.

## Setup

1. Copy `.env.example` → `.env` và điền Firebase config (dùng chung với web)
2. Chạy backend API tại `http://localhost:5288`
3. `npm install && npm start`

**Expo SDK:** project dùng **SDK 54** để khớp **Expo Go** trên Play Store (hỗ trợ SDK 54). Nếu đổi SDK, chạy `npx expo install expo@<version>` rồi `npx expo install --fix`.

## Cấu trúc Phase 1 (MVP)

- **Auth**: Login, Register, ForgotPassword (Firebase + Redux)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Screens**: Practice (placeholder), Profile
- **API**: Axios + JWT interceptor, sync với backend `/api/auth/sync`

## Chạy

- `npm start` - Expo dev server (LAN, có QR)
- `npm run start:qr` - Xóa cache + LAN (nếu lỗi)
- `npm run start:tunnel` - Tunnel (điện thoại khác mạng WiFi)
- `npm run android` - Android
- `npm run ios` - iOS (cần Mac)
- `npm run web` - Web

### Không thấy mã QR?

1. **Tắt chế độ CI** (Expo ẩn QR khi `CI=true`):
   ```powershell
   $env:CI=$null
   npm run start:qr
   ```
   Hoặc double-click **`start-expo.bat`** (Windows) / chạy **`.\start-expo.ps1`**.

2. **Dùng terminal thật** (Windows Terminal, CMD, PowerShell ngoài Cursor) — một số IDE không hiển thị QR ASCII.

3. **Tunnel** (không cùng WiFi hoặc vẫn không có QR):
   ```bash
   npm run start:tunnel
   ```
   Dùng link `exp://...` trong Expo Go.

4. **Nhập URL thủ công** trong Expo Go: `exp://<IP_MÁY_TÍNH>:8081` (điện thoại và PC cùng WiFi).

### Lỗi "Network Error" khi đăng nhập

1. **Backend** phải chạy: `cd backend/VstepWritingLab.API && dotnet run --launch-profile http` (đã listen `0.0.0.0:5288` để điện thoại trong LAN gọi được).
2. **Android Emulator**: app tự dùng `http://10.0.2.2:5288` khi `.env` là localhost.
3. **Điện thoại thật + Expo Go** (cùng WiFi với PC): trong `mobile-app/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.x.x:5288
   ```
   Lấy IP bằng `ipconfig` (IPv4). **Không** dùng `localhost` trên điện thoại.
4. **Windows Firewall**: cho phép inbound TCP port **5288** (hoặc tạm tắt firewall để thử).
5. Khởi động lại Metro: `npm run start:qr`.

**Hướng dẫn chi tiết (firewall, curl, checklist):** xem [`../docs/API_TROUBLESHOOTING_VI.md`](../docs/API_TROUBLESHOOTING_VI.md).  
*(Hướng dẫn generic dùng port `5260` / `src/api/client.ts` **không** khớp repo này — backend dùng **`5288`**, mobile dùng `src/config/env.ts` + `src/services/api.ts`.)*
