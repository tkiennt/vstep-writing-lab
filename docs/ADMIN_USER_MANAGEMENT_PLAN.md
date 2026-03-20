# Plan: Admin User Management Flow

## 1. Tổng quan project

- **VSTEP Writing Lab**: Nền tảng luyện viết VSTEP với AI grading
- **Auth**: Firebase Authentication (email/password, Google)
- **Database**: Firestore – collection `users` (document ID = Firebase UID)
- **Backend**: ASP.NET Core 8 (VstepWritingLab.API hoặc VSTEPWritingAI)
- **Frontend**: Next.js 14+, route `/admin/user-management` (role `admin`)

---

## 2. Cấu trúc User trong Firestore (collection `users`)

Document ID = Firebase Auth UID.

```typescript
// Cấu trúc User document (Firestore collection "users")
interface FirestoreUserDoc {
  // Document ID = Firebase UID
  UserId?: string;           // = Firebase UID (có thể trùng với doc ID)
  Email: string;
  DisplayName: string;
  AvatarUrl?: string;         // (VstepWritingLab.Shared)
  
  Role: string;               // "student" | "teacher" | "admin"
  IsActive: boolean;          // false = vô hiệu hóa (banned)
  
  // Optional (VstepWritingLab.Shared)
  OnboardingCompleted?: boolean;
  CurrentLevel?: string;      // B1, B2, C1
  TargetLevel?: string;
  
  CreatedAt: Timestamp;
  LastActiveAt?: Timestamp;    // VstepWritingLab.API
  LastLoginAt?: Timestamp;    // VSTEPWritingAI
}
```

**Lưu ý**: Hai backend có thể dùng tên field khác nhau (`LastActiveAt` vs `LastLoginAt`). Cần thống nhất hoặc hỗ trợ cả hai.

---

## 3. Luồng tạo user hiện tại

1. User đăng ký qua `/register` → `createUserWithEmailAndPassword` (Firebase Auth)
2. `updateProfile` với displayName
3. `onIdTokenChanged` → gọi `syncUser(firebaseUser)` → `POST /api/auth/sync` (Bearer token)
4. Backend tạo/merge document trong `users/{uid}` với thông tin từ token + Firestore

---

## 4. Backend API hiện có (Admin)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Lấy danh sách users |
| GET | `/api/admin/users/{id}` | Lấy chi tiết 1 user (VSTEPWritingAI) |
| PATCH | `/api/admin/users/{id}` | Cập nhật (Role, IsActive) |
| DELETE | `/api/admin/users/{id}` | Xóa user (chỉ Firestore) |
| GET | `/api/admin/users/{id}/submissions` | Lịch sử bài nộp (VSTEPWritingAI) |
| GET | `/api/admin/users/{id}/progress` | Tiến độ học (VSTEPWritingAI) |

**Request PATCH** (`UpdateUserRequest`):
```json
{
  "Role": "student" | "admin",
  "IsActive": true | false
}
```

---

## 5. Frontend hiện tại

- **Trang**: `web/src/app/admin/user-management/page.tsx`
- **Trạng thái**: Dùng **MOCK_USERS** – chưa gọi API thật
- **Chức năng UI đã có**: danh sách user, đổi role, toggle status (Block/Unblock), modal Add User

---

## 6. Plan triển khai

### Phase 1: Kết nối API thật

1. **Admin user service (frontend)**
   - Tạo `web/src/services/adminUserService.ts`:
     - `getAllUsers()` → GET `/api/admin/users`
     - `getUserById(id)` → GET `/api/admin/users/{id}`
     - `updateUser(id, { role?, isActive? })` → PATCH `/api/admin/users/{id}`
     - `deleteUser(id)` → DELETE `/api/admin/users/{id}`

2. **Cập nhật trang user-management**
   - Thay `MOCK_USERS` bằng data từ API
   - Dùng `useEffect` + `adminUserService.getAllUsers()` để load
   - Loading state, error handling

### Phase 2: Xóa account (Delete)

**Backend**:
- Hiện tại `DeleteUserAsync` chỉ xóa document Firestore
- **Cần thêm**: Xóa user trên Firebase Auth bằng Firebase Admin SDK:
  ```csharp
  await FirebaseAuth.DefaultInstance.DeleteUserAsync(userId);
  ```
- Thứ tự: (1) Xóa Firestore doc, (2) Xóa Firebase Auth user
- Xử lý lỗi: user không tồn tại, quyền không đủ

**Frontend**:
- Nút "Xóa" với confirm dialog
- Gọi `adminUserService.deleteUser(id)`
- Refresh danh sách sau khi xóa thành công

### Phase 3: Vô hiệu hóa (Disable)

**Backend**:
- Đã có: PATCH với `IsActive: false`
- Middleware đã check `IsActive` → trả 403 "Account has been deactivated"

**Frontend**:
- Nút "Block" / "Vô hiệu hóa" → gọi `updateUser(id, { isActive: false })`
- Nút "Unblock" / "Kích hoạt" → `updateUser(id, { isActive: true })`
- Cập nhật badge trạng thái (Active / Locked) theo `IsActive`

### Phase 4: Xem thông tin chi tiết

**Backend**:
- VSTEPWritingAI đã có: GET `/api/admin/users/{id}`
- VstepWritingLab.API: cần thêm endpoint GET by id nếu chưa có

**Frontend**:
- Modal/drawer "Xem thông tin" khi click vào user
- Hiển thị: UserId, Email, DisplayName, Role, IsActive, CreatedAt, LastActiveAt
- (Optional) Tab submissions, progress nếu backend hỗ trợ

---

## 7. Checklist triển khai

| # | Task | Backend | Frontend |
|---|------|---------|----------|
| 1 | Admin user service | - | `adminUserService.ts` |
| 2 | Load users từ API | - | `user-management/page.tsx` |
| 3 | Xóa account | Thêm Firebase Auth delete | Nút Delete + confirm |
| 4 | Vô hiệu hóa | Đã có PATCH | Nút Block/Unblock |
| 5 | Xem thông tin | GET by id (nếu thiếu) | Modal chi tiết user |
| 6 | Error handling | - | Toast/alert |
| 7 | Loading states | - | Skeleton/spinner |

---

## 8. Lưu ý kỹ thuật

1. **Firebase Admin SDK**: Cần service account và quyền `Firebase Authentication Admin` để xóa user.
2. **Cascade delete**: Xóa user có thể cần xóa thêm dữ liệu liên quan (submissions, progress, drafts) – tùy yêu cầu.
3. **Role admin**: Middleware/Policy `AdminOnly` hoặc `[Authorize(Roles = "admin")]` phải được cấu hình đúng.
4. **API base URL**: Dùng **VstepWritingLab.API** (port 7133). Đặt `NEXT_PUBLIC_API_URL=https://localhost:7133/api` và `NEXT_PUBLIC_API_BASE_URL=https://localhost:7133`.

---

## 9. Cấu trúc User (copy cho AI)

```
Firestore collection: users
Document ID: Firebase Auth UID

Fields:
- UserId (string) = Firebase UID
- Email (string)
- DisplayName (string)
- AvatarUrl (string, optional)
- Role (string) = "student" | "teacher" | "admin"
- IsActive (boolean) = true | false (false = vô hiệu hóa)
- OnboardingCompleted (boolean, optional)
- CurrentLevel (string, optional) = "B1"|"B2"|"C1"
- TargetLevel (string, optional) = "B1"|"B2"|"C1"
- CreatedAt (Timestamp)
- LastActiveAt (Timestamp, optional) hoặc LastLoginAt (Timestamp, optional)
```
