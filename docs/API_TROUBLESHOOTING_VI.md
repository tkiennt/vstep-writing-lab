# Khắc phục: Không gọi được API (Mobile / Emulator)

> **Lưu ý repo này:** API HTTP dev đang dùng cổng **`5288`** (không còn `5260`).  
> Nếu vẫn thấy lỗi nhắc `5260` → cập nhật `mobile-app/.env`, rồi chạy lại Expo với cache sạch: `npx expo start -c`.

## Nguyên nhân thường gặp

- Backend **chưa chạy** hoặc đang chạy **sai cổng**.
- **Windows Firewall** chặn inbound TCP (cổng hiện tại: **5288**).
- **`EXPO_PUBLIC_API_URL`** trong `mobile-app/.env` không khớp cổng backend (hoặc Metro chưa nạp lại `.env`).

## Kiến trúc API trong project (khác ví dụ generic)

| Thành phần | Đường dẫn |
|------------|-----------|
| Backend | `backend/VstepWritingLab.API/` |
| Cổng HTTP (profile `http`) | **`http://0.0.0.0:5288`** |
| Mobile — base URL + `/api` | `mobile-app/src/config/env.ts` → `config.API_URL` |
| Mobile — Axios | `mobile-app/src/services/api.ts` |
| Web | `web/src/services/api.ts`, `web/.env` (`NEXT_PUBLIC_API_*`) |

**Đăng nhập:** Firebase Auth (client) → sau đó gọi **`POST /api/auth/sync`** với header `Authorization: Bearer <Firebase ID token>`.  
Không có `POST /api/auth/login` với email/password trên backend như một số template khác.

---

## Giải pháp nhanh (~5 phút)

### Bước 1: Chạy backend đúng profile

```powershell
cd backend/VstepWritingLab.API
dotnet run --launch-profile http
```

Hoặc từ thư mục `backend`:

```powershell
.\restart-api.ps1
```

**Kỳ vọng trong log:**

```text
Now listening on: http://0.0.0.0:5288
```

### Bước 2: Mở Windows Firewall cho cổng 5288

**Cách A — Command Prompt (Run as Administrator):**

```cmd
netsh advfirewall firewall add rule name="VSTEP API HTTP 5288" dir=in action=allow protocol=TCP localport=5288
netsh advfirewall firewall show rule name="VSTEP API HTTP 5288"
```

**Cách B — GUI:** Inbound Rules → New Rule → Port → TCP **5288** → Allow.

**Cách C — chỉ để test:** tạm tắt firewall (nhớ bật lại sau).

### Bước 3: Cấu hình URL trong app

**`mobile-app/.env`** (bắt buộc khớp cổng backend):

```env
EXPO_PUBLIC_API_URL=http://localhost:5288
```

- **Android Emulator:** app tự map `localhost` → **`http://10.0.2.2:5288`** (xem `src/config/env.ts`).
- **Điện thoại thật (cùng WiFi):**

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5288
```

- **Điện thoại thật qua USB (không cần cùng WiFi):** chuyển tiếp cổng từ máy tính xuống điện thoại:

```powershell
adb reverse tcp:5288 tcp:5288
adb reverse --list
```

Trong `mobile-app/.env`:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:5288
```

*(Mỗi lần rút/cắm USB có thể cần chạy lại `adb reverse`.)*

Sau khi sửa `.env`:

```bash
cd mobile-app
npx expo start -c
```

### Bước 4: Test API từ máy Windows

```powershell
# Swagger (trình duyệt)
start http://localhost:5288/swagger

# Hoặc curl (kiểm tra server có phản hồi)
curl -s -o NUL -w "%{http_code}" http://localhost:5288/swagger/index.html
```

Nếu `curl`/trình duyệt **không kết nối được** → backend chưa chạy hoặc firewall chặn.

### Bước 5: Chạy lại mobile

```bash
cd mobile-app
npm start
# hoặc
npx expo start -c
```

---

## Kiểm tra nhanh kết nối (PC / điện thoại cùng WiFi)

```text
GET http://<IP_PC>:5288/api/health
```

Kỳ vọng JSON: `{"status":"ok","time":"..."}` (trên PC có thể `curl http://localhost:5288/api/health`).

---

## Checklist

- [ ] Backend log có **`Now listening on: http://0.0.0.0:5288`**
- [ ] Firewall cho phép TCP **5288** inbound
- [ ] `mobile-app/.env` khớp cách kết nối: **emulator** → `localhost`; **WiFi** → `http://192.168.x.x:5288`; **USB+ADB** → `http://127.0.0.1:5288` + `adb reverse tcp:5288 tcp:5288`
- [ ] Đã **`npx expo start -c`** sau khi đổi `.env`
- [ ] Test `http://localhost:5288/swagger` trên PC thành công

## Nếu backend dùng cổng khác

Đổi **cùng một cổng** ở:

1. `backend/VstepWritingLab.API/Properties/launchSettings.json` → `applicationUrl`
2. `mobile-app/.env` → `EXPO_PUBLIC_API_URL=http://localhost:<PORT>`
3. `web/.env` (nếu dùng web) → `NEXT_PUBLIC_API_*`

Rồi mở firewall cho `<PORT>` tương ứng.

## Lỗi `address already in use` (5288) hoặc build `file locked by VstepWritingLab.API`

**Nguyên nhân:** Đã có **một** `dotnet run` đang chạy (hoặc process cũ chưa tắt hết). Mở thêm instance thứ hai → không bind được cổng; build lại khi API còn chạy → DLL bị khóa.

**Cách xử lý:**

1. **Tắt hết** API trước khi build/run lại:
   - Trong terminal đang `dotnet run`: **Ctrl+C** (đợi đến khi thoát hẳn).
   - Hoặc Task Manager → kết thúc **VstepWritingLab.API** / **dotnet** (đúng instance).

2. **Dùng script** (từ thư mục `backend`):
   ```powershell
   cd D:\...\vstep-writing-lab-trungkien\backend
   .\restart-api.ps1
   ```
   Script sẽ dừng listener cổng 5260/5288/7133 và process `VstepWritingLab.API`, rồi `dotnet run`.

3. **Đừng** `cd backend\VstepWritingLab.API` khi bạn **đã đứng** trong `...\VstepWritingLab.API` — sẽ thành đường dẫn lồng nhau (`...\API\backend\...`). Nếu prompt đã là `...\VstepWritingLab.API>`, chỉ cần:
   ```powershell
   dotnet run --launch-profile http
   ```

4. Kiểm tra cổng trống:
   ```powershell
   netstat -ano | findstr ":5288"
   ```
   Không có dòng `LISTENING` → có thể chạy API.

## Debug thêm

| Hiện tượng | Gợi ý |
|------------|--------|
| **`HTTP 401`** (body rỗng) khi **Gửi chấm AI** | JWT Firebase hết hạn / chưa đăng nhập / token chỉ còn trong AsyncStorage. App đã: **retry 1 lần** sau `getIdToken(true)`, **`restoreSession`** đợi Firebase persistence. **Không** dùng token AsyncStorage khi Firebase đã logout. Thử **đăng nhập lại**. |
| **`Failed to parse AI response into valid JSON`** (chấm AI) | Thường do: **JSON bị cắt** (output dài), root dạng **`[{...}]`**, field **`null`** / số thay vì chuỗi. Code đã xử lý (parse mảng, `maxOutputTokens` lớn hơn, chuỗi linh hoạt). **Restart API** sau khi build. Vẫn lỗi → xem log backend dòng `Failed to parse AI JSON response`; kiểm tra **`Gemini:ApiKey`**, quota, và mạng. |
| **`Failed to bind ... 5288: address already in use`** | Tắt instance API cũ hoặc `.\restart-api.ps1` — xem mục trên |
| **`file locked by VstepWritingLab.API`** (MSB3027) | Dừng `dotnet run` / API rồi build lại |
| Axios **không có `response`** (network error) | Host/cổng/firewall; emulator dùng `10.0.2.2` + đúng port |
| **`401`** từ `/api/auth/sync` | Firebase token / sync logic — đã tới được server |
| Vẫn báo **`5260`** trong app | Bundle cũ: xóa cache Expo, kiểm tra `.env` và `env.ts` |

---

*Tài liệu này thay thế hướng dẫn generic dùng `5260` và `src/api/client.ts` — không áp dụng trực tiếp cho repo VSTEP Writing Lab.*
