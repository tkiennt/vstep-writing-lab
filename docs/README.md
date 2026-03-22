# VSTEP Writing Lab

AI-powered platform for practicing and grading VSTEP Writing tasks.

## Tài liệu bổ sung

- **[PROJECT_HANDOFF_AND_SESSION_LOG_VI.md](./PROJECT_HANDOFF_AND_SESSION_LOG_VI.md)** — Tổng hợp lỗi đã gặp, file quan trọng, roadmap hoàn thành project (handoff cho dev/AI).
- **[API_TROUBLESHOOTING_VI.md](./API_TROUBLESHOOTING_VI.md)** — Xử lý sự cố API & mobile.
- **[CRITICAL_FIXES_MAP_VI.md](./CRITICAL_FIXES_MAP_VI.md)** — Ánh xạ spec “3 lỗi critical” → file thật trong repo (`api.ts`, `GeminiJsonParsing`, `/api/health`).

## Project Structure

- `backend/`: .NET 8+ REST API (3-Layer Architecture)
- `web/`: Next.js Web Frontend (TypeScript, TailwindCSS)
- `mobile-app/`: React Native Mobile App (Expo, TypeScript)
- `docs/`: Project documentation and architecture diagrams
- `scripts/`: Useful development and deployment scripts

## Tech Stack

### Backend
- Framework: .NET 8
- Database: Firebase Firestore
- Auth: Firebase Authentication
- Storage: Firebase Storage
- ORM: Entity Framework Core (for Firestore via custom provider or repository pattern)

### Frontend (Web & Mobile)
- Web: Next.js 14+
- Mobile: React Native
- State Management: React Query / Zustand
- Styling: TailwindCSS (Web)

## Getting Started

### Prerequisites
- Node.js (v18+)
- .NET 8 SDK
- Firebase CLI
- Java Development Kit (for Android mobile development)

### Backend Setup
1. Navigate to `backend/`
2. Configure `appsettings.json` with Firebase credentials.
3. Run `dotnet run --project VstepWritingLab.API`

### Web Setup
1. Navigate to `web/`
2. Run `npm install`
3. Configure `.env.local`
4. Run `npm run dev`

### Mobile Setup
1. Navigate to `mobile-app/`
2. Run `npm install`
3. Run `npx react-native run-android` or `npx react-native run-ios`

## License
MIT
