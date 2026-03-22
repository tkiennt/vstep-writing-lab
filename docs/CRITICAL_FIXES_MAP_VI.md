# Ánh xạ “3 Critical Errors” → code thực tế trong repo

Tài liệu spec (client.ts mới, GeminiService.cs mới, endpoint `/api/submissions/submit`…) **không trùng** cấu trúc hiện tại. Dưới đây là **file đúng** trong project và việc đã làm / cách test.

---

## 1. Network Error + URL sai trên điện thoại

| Spec gợi ý | Repo thực tế |
|------------|----------------|
| `mobile-app/src/api/client.ts` | **Không** tạo file mới — dùng **`mobile-app/src/services/api.ts`** (axios `baseURL` = `config.API_URL` = `.../api`) |
| `EXPO_PUBLIC_API_URL` | **`mobile-app/.env`** + **`mobile-app/src/config/env.ts`** (emulator → `10.0.2.2`, máy thật → IP LAN hoặc `adb reverse` + `127.0.0.1`) |

**Đã bổ sung:** `extractApiErrorMessage` + interceptor gắn `userMessage` để luôn có nội dung lỗi đọc được.

---

## 2. Modal “Gửi bài thất bại” / trống

| Spec gợi ý | Repo thực tế |
|------------|----------------|
| `ErrorModal.tsx` | **`mobile-app/src/components/ErrorModal.tsx`** (tùy chọn dùng thay `Alert`) |
| `formatGradeError` | **`mobile-app/src/utils/apiError.ts`** — `extractApiErrorMessage`, `attachUserMessage` |
| `PracticeWriteScreen` | `Alert.alert('Lỗi', extractApiErrorMessage(err))` |

**Chấm điểm:** timeout **`mobile-app/src/services/gradingService.ts`** = **120s** (không chỉ 30s).

---

## 3. “Failed to parse AI response into valid JSON”

| Spec gợi ý | Repo thực tế |
|------------|----------------|
| `GeminiService.cs` + `CleanGeminiResponse` | **`backend/VstepWritingLab.Data/Services/Gemini/GeminiGradingService.cs`** + **`GeminiJsonParsing.cs`** + **`GeminiClient.cs`** (`responseMimeType: application/json`, `maxOutputTokens` lớn trong `GradeAsync`) |

Không thêm schema JSON mới trong spec — domain hiện tại dùng **`InternalAiOutput`** / **`AiGradingOutput`** đã định nghĩa trong service.

---

## 4. Health check (test từ PC / điện thoại)

Spec đề xuất `/api/auth/health` — trong repo **chưa có** auth health.

**Đã thêm:** `GET /api/health` → `{ status, time }` (xem **`Program.cs`**).

**Test:**

```bash
curl http://localhost:5288/api/health
# Trên điện thoại (cùng WiFi): http://<IP_PC>:5288/api/health
```

---

## 5. Checklist nhanh

- [ ] `.env`: `EXPO_PUBLIC_API_URL=http://<IPv4_PC>:5288` (WiFi) hoặc `adb reverse` + `127.0.0.1` (Android USB)
- [ ] Backend: `dotnet run --launch-profile http`.
- [ ] `curl`/trình duyệt: `/api/health` OK.
- [ ] `npx expo start -c` sau khi đổi `.env`.
- [ ] Chấm AI: nếu lỗi JSON — xem log API dòng parse Gemini.

---

*Cập nhật khi đổi tên endpoint hoặc cấu trúc axios.*
