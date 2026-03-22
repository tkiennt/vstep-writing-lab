# Hướng dẫn setup khi mới clone (nhóm / nhánh `duy`)

Repo: `https://github.com/tkiennt/vstep-writing-lab` — app gồm **backend .NET**, **web Next.js**, **mobile Expo** (thư mục `mobile-app/`).

## 1. Công cụ cần cài

| Thành phần | Ghi chú |
|------------|---------|
| **Git** | Clone / pull / push |
| **Node.js** | LTS (ví dụ 20.x) — cho `web/` và `mobile-app/` |
| **.NET SDK** | Khớp với `global.json` / file `.csproj` (thường **.NET 8**) |
| **Expo Go** trên điện thoại | Cùng phiên bản SDK với project (**SDK 54**) |

Tùy chọn: Android Studio + SDK (nếu build native), Firebase CLI (nếu deploy functions).

## 2. Clone và chọn nhánh

```bash
git clone https://github.com/tkiennt/vstep-writing-lab.git
cd vstep-writing-lab
git fetch origin
git checkout duy
git pull origin duy
```

> Nhánh `duy` có thể lệch so với `main`. Nếu cần code mới nhất từ `main`, hỏi lead trước khi merge/rebase.

## 3. Backend API (`backend/VstepWritingLab.API`)

```powershell
cd backend\VstepWritingLab.API
```

### User Secrets (bắt buộc — không commit key)

```powershell
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
```

Chi tiết: `backend/VstepWritingLab.API/README-SECRETS.md`. Cần thêm file service account Firebase nếu project yêu cầu (xem `appsettings` / tài liệu nội bộ).

### Chạy

```powershell
cd ..\..   # về root repo nếu đang ở API
dotnet run --project backend/VstepWritingLab.API/VstepWritingLab.API.csproj --launch-profile http
```

Mặc định lắng nghe **`http://0.0.0.0:5288`**. Kiểm tra: trình duyệt mở `http://localhost:5288/swagger`.

## 4. Mobile (`mobile-app/`)

```powershell
cd mobile-app
copy .env.example .env
```

Sửa `.env`:

- **Firebase**: giữ các biến `EXPO_PUBLIC_FIREBASE_*` (cùng project với web).
- **`EXPO_PUBLIC_API_URL`**:
  - Máy ảo Android emulator: `http://localhost:5288` (app map sang `10.0.2.2`).
  - **Điện thoại thật** (Expo Go, cùng Wi‑Fi với PC): `http://<IPv4_máy_tính>:5288` — lấy IP bằng `ipconfig` / `ip a`. **Không** dùng `localhost` trên điện thoại.
  - Không chèn khoảng trắng trong URL.

Cài dependency và chạy:

```powershell
npm install
npm run start:qr
```

Quét QR bằng Expo Go hoặc `a` (Android). Nếu lỗi mạng khi đăng nhập: backend đang chạy, firewall Windows mở **TCP 5288**, đúng IP trong `.env`. Xem thêm `docs/API_TROUBLESHOOTING_VI.md` và `mobile-app/README.md`.

## 5. Web (`web/`)

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Điền biến môi trường theo `.env.example` / README trong `web/`.

## 6. Checklist nhanh

- [ ] `dotnet run` backend — Swagger mở được.
- [ ] `Gemini:ApiKey` đã set (user-secrets).
- [ ] Mobile: file `.env` tồn tại, `EXPO_PUBLIC_API_URL` đúng môi trường.
- [ ] Điện thoại + PC cùng Wi‑Fi; firewall cho cổng **5288** nếu gọi API qua LAN.

---

*Cập nhật theo nhánh `duy` — cấu trúc thư mục `mobile-app` thay cho `mobile` cũ nếu tài liệu cũ vẫn nhắc `mobile`.*
