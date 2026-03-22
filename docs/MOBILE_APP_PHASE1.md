# VSTEP Writing Lab Mobile - Phase 1 MVP Summary

## Đã triển khai (Week 1-2)

### 1. Expo Project
- **Thư mục**: `mobile-app/`
- **Tech**: React Native Expo ~55, TypeScript

### 2. Redux Toolkit
- `authSlice`: login, register, logout, restoreSession, forgotPassword
- Token & user lưu AsyncStorage
- Sync với backend `/api/auth/sync`

### 3. React Navigation
- Stack: Login, Register, ForgotPassword
- Bottom Tabs: Practice, Profile
- Auth gate: chưa đăng nhập → Auth stack, đã đăng nhập → Main tabs

### 4. Auth Screens (Tiếng Việt)
- **LoginScreen**: email, password
- **RegisterScreen**: họ tên, email, password, xác nhận
- **ForgotPasswordScreen**: email → gửi link reset

### 5. Firebase Auth
- Cùng config với web (vstep-writing-lab)
- Cần `.env` với `EXPO_PUBLIC_FIREBASE_*`

### 6. API Client
- Axios + JWT interceptor (Firebase token)
- Fallback token từ AsyncStorage khi restore session

### 7. Backend
- CORS mở rộng: localhost, 127.0.0.1, 192.168.x.x, 10.x (cho Expo/device dev)

## Chạy thử

```bash
# 1. Backend
cd backend/VstepWritingLab.API && dotnet run

# 2. Mobile - copy .env
cd mobile-app
cp .env.example .env   # điền Firebase config từ web/.env
npm start
```

Trên thiết bị vật lý: đặt `EXPO_PUBLIC_API_URL=http://<MÁY_CỦA_BẠN_IP>:5288` trong .env

## Còn lại (Week 3-4)

- [ ] PracticeScreen: danh sách Task 1, Task 2, Full Mock
- [ ] EditorScreen: prompt, text input, timer, word counter, auto-save
- [ ] FeedbackScreen: AI score, criteria, suggestions
- [ ] BasicProgressScreen
- [ ] Onboarding flow (nếu chưa hoàn thành)
