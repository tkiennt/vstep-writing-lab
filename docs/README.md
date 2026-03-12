# VSTEP Writing Lab

AI-powered platform for practicing and grading VSTEP Writing tasks.

## Project Structure

- `backend/`: .NET 8 REST API (3-Layer Architecture)
- `web/`: Next.js Web Frontend (TypeScript, TailwindCSS)
- `mobile/`: React Native Mobile App (TypeScript)
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
1. Navigate to `mobile/`
2. Run `npm install`
3. Run `npx react-native run-android` or `npx react-native run-ios`

## License
MIT
