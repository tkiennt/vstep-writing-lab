# Tổng hợp lỗi đã gặp & hướng hoàn thành project (Handoff)

Tài liệu dành cho dev/AI (Claude) nắm **tổng quan**, **lịch sử sự cố** trong phiên làm việc, và **lộ trình** đưa VSTEP Writing Lab về trạng thái hoàn chỉnh.

---

## 1. Cấu trúc repo (đọc nhanh)

| Thư mục | Vai trò |
|--------|---------|
| `backend/` | ASP.NET Core API (`VstepWritingLab.API`), Business, Data, Domain, Shared — Firestore, Firebase Auth, **Gemini** chấm bài |
| `web/` | Next.js — luyện tập / grading (tham chiếu API, types) |
| `mobile-app/` | **Expo (SDK 54)** + React Navigation + Redux — Practice, Auth, gọi API |
| `functions/` | Firebase Cloud Functions (nếu dùng) |
| `docs/` | Kiến trúc, troubleshooting, kế hoạch |

**Điểm tích hợp chính**

- API base: `POST /api/Grading/grade` (cần **Bearer Firebase ID token**).
- Danh sách đề: `GET /api/v2/ExamPrompts` (mobile).
- Backend dev: `http://0.0.0.0:5288` (profile `http` trong `launchSettings.json`).
- Mobile env: `EXPO_PUBLIC_API_URL=http://<host>:5288` → `config.API_URL` = `.../api`.

---

## 2. Lỗi / sự cố đã gặp (theo thứ tự chủ đề)

### A. Backend — cổng & build

| Hiện tượng | Nguyên nhân | Cách xử lý |
|------------|-------------|------------|
| `Failed to bind ... 5288: address already in use` | Chạy **2 instance** `dotnet run` hoặc process cũ chưa tắt | Ctrl+C → `.\restart-api.ps1` (trong `backend/`) hoặc kill process / `netstat` cổng 5288 |
| `MSB3027` / `file locked by VstepWritingLab.API` | Build khi API **đang chạy** (DLL bị khóa) | **Dừng API** rồi `dotnet build` / `dotnet run` |
| `cd backend\VstepWritingLab.API` sai path | Đã đứng trong `...\VstepWritingLab.API` rồi `cd` nested | Chỉ `dotnet run --launch-profile http` |

### B. Mobile — kết nối API (Network Error)

| Hiện tượng | Nguyên nhân | Cách xử lý |
|------------|-------------|------------|
| `EXPO_PUBLIC_API_URL=http://127.0.0.1` trên **điện thoại thật** | `127.0.0.1` = máy điện thoại, **`http://127.0.0.1:5288`** không phải PC | **WiFi:** `ipconfig` → IPv4 adapter Wi‑Fi/Ethernet → `http://192.168.x.x:5288` hoặc `10.x.x.x` **cùng subnet** với điện thoại. **USB Android:** `adb reverse tcp:5288 tcp:5288` rồi mới dùng `127.0.0.1` |
| Emulator Android | `localhost` cần map `10.0.2.2` | Đã xử lý trong `mobile-app/src/config/env.ts` khi `Constants.isDevice === false` |
| Firewall | Windows chặn inbound 5288 | Rule cho phép TCP 5288 (hoặc tắt tạm để test) |

### C. Backend — chấm AI (Gemini)

| Hiện tượng | Nguyên nhân | Cách xử lý (đã code) |
|------------|-------------|----------------------|
| `Failed to parse AI response into valid JSON` | Markdown quanh JSON, preamble, JSON cắt (**MAX_TOKENS**), `null`/sai kiểu field, root `[{...}]`, prompt mẫu `estimated_weeks` sai | `GeminiJsonParsing.cs` (trích JSON, `int`/`bool` linh hoạt, mảng root), tăng **`maxOutputTokens`** trong `GeminiGradingService` (vd. 16384), sửa prompt |
| Exam / cache “Exam not found” | Map Firestore ID → domain (đã sửa `ExamPromptDocument` / `ExamPrompt.Create`) | Restart API sau deploy; cache ~5 phút |

### D. Mobile — UX lỗi chấm bài

| Hiện tượng | Nguyên nhân | Cách xử lý (đã code) |
|------------|-------------|----------------------|
| `Gửi bài thất bại` / popup **trống** | Axios không parse `message`; body rỗng; **timeout 30s** khi Gemini trả về chậm | `gradingService`: **timeout 120s**; `PracticeWriteScreen`: `formatGradeError` không trả chuỗi rỗng, đọc `message`/`title`/`detail` |

---

## 3. File / cấu hình “để Claude đọc là hiểu project”

1. **Backend**
   - `backend/VstepWritingLab.API/Program.cs` — CORS, HTTPS, Firebase.
   - `backend/VstepWritingLab.API/Properties/launchSettings.json` — `applicationUrl` (5288).
   - `appsettings.json` / secrets — `Gemini:ApiKey`, `Gemini:BaseModel`, Firebase.
   - `backend/VstepWritingLab.Data/Services/Gemini/` — `GeminiClient`, `GeminiGradingService`, `GeminiJsonParsing`.
2. **Mobile**
   - `mobile-app/.env` — `EXPO_PUBLIC_API_URL` (không commit secret thật nếu không dùng `.gitignore`).
   - `mobile-app/src/config/env.ts` — resolve `localhost` / emulator.
   - `mobile-app/src/services/api.ts`, `gradingService.ts`, `examPromptService.ts`.
   - `mobile-app/app.config.js` — dotenv.
3. **Docs**
   - `docs/API_TROUBLESHOOTING_VI.md` — lỗi API + cổng + mobile.
   - `docs/architecture.md` — tổng thể hệ thống.
4. **Bảo mật**
   - `backend/VstepWritingLab.API/README-SECRETS.md` — không lộ service account / API key.

---

## 4. Đồng bộ để “project hoàn chỉnh” (roadmap gợi ý)

### Giai đoạn 1 — Ổn định dev (hiện tại)

- [ ] Backend chạy một instance, `swagger`/`health` OK.
- [ ] Mobile: đúng `EXPO_PUBLIC_API_URL` theo **WiFi / USB / emulator**.
- [ ] Chấm AI: không còn parse JSON; nếu còn — xem **log API** (`Failed to parse AI JSON response` + snippet).
- [ ] Firebase: Auth sync với API (token + `userUid`).

### Giai đoạn 2 — Tính năng & UX mobile

- [ ] **Kết quả chấm:** sau `POST /grading/grade` hiển thị đủ **điểm, feedback, criteria** (hiện có thể chỉ `Alert` tóm tắt — cần màn **chi tiết** giống web nếu product yêu cầu).
- [ ] **Lịch sử bài đã chấm** (Firestore `grading_results` hoặc API list).
- [ ] Xử lý **offline / retry** nhẹ (optional).

### Giai đoạn 3 — Web + mobile parity

- [ ] So khớp `web/src` (grading types, `gradeEssay`) với mobile response.
- [ ] E2E: một flow đăng nhập → luyện tập → chấm → xem kết quả.

### Giai đoạn 4 — Triển khai

- [ ] `backend` deploy (Azure / VM / container) — HTTPS, biến môi trường Gemini/Firebase.
- [ ] Mobile: `EXPO_PUBLIC_API_URL` trỏ production; **EAS Build** nếu dùng dev client.
- [ ] Giới hạn quota / rate limit API (Gemini).

### Giai đoạn 5 — Chất lượng

- [ ] Unit test parse JSON (`GeminiJsonParsing`) với sample từ Gemini.
- [ ] CI: `dotnet build`, `npm test`/`lint` mobile & web.
- [ ] Dọn warning: nullable `ExamPromptsController`, obsolete `GoogleCredential.FromStream`.

---

## 5. Checklist nhanh cho người mới vào project

1. Clone repo, `.env` (mobile/web) từ `.env.example`.
2. `backend`: cấu hình Gemini + Firebase → `dotnet run --launch-profile http`.
3. `mobile-app`: `npm i` → `npx expo start --clear --lan`.
4. Điện thoại thật: **IP LAN** trong `.env`, cùng WiFi với PC.
5. Đọc `docs/API_TROUBLESHOOTING_VI.md` khi lỗi mạng / cổng.

---

## 6. Liên kết tài liệu trong repo

| File | Nội dung |
|------|----------|
| `docs/architecture.md` | Sơ đồ, layer backend |
| `docs/API_TROUBLESHOOTING_VI.md` | API, cổng, mobile, JSON/Gemini |
| `docs/MOBILE_APP_PHASE1.md` | Kế hoạch mobile (nếu có) |
| `docs/ADMIN_USER_MANAGEMENT_PLAN.md` | Admin (nếu có scope) |

---

*Tài liệu này tổng hợp phiên làm việc (debug cổng, WiFi, Gemini JSON, timeout, Alert lỗi) và không thay thế `README.md` gốc — nên cập nhật khi stack hoặc version đổi.*
