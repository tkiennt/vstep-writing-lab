# VSTEP Writing Lab - Web Frontend

Next.js-based web application for AI-powered VSTEP writing practice.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts (ready to use)
- **Icons**: Lucide React
- **Authentication**: Firebase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project configured
- Backend API running

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials and API URL

# Run development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   ├── (dashboard)/          # Dashboard pages
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── practice/         # Writing practice
│   │   │   ├── history/          # Essay history
│   │   │   ├── progress/         # Progress tracking
│   │   │   ├── profile/          # User profile
│   │   │   └── onboarding/       # First-time user setup
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # ShadCN UI components
│   │   ├── common/               # Reusable components
│   │   └── features/             # Feature-specific components
│   ├── store/                    # Zustand stores
│   │   ├── useAuthStore.ts       # Authentication state
│   │   ├── useUserStore.ts       # User data state
│   │   └── useWritingStore.ts    # Writing session state
│   ├── services/                 # API & Firebase services
│   │   ├── api.ts                # Axios instance
│   │   ├── firebase.ts           # Firebase config
│   │   ├── authService.ts        # Auth operations
│   │   ├── essayService.ts       # Essay operations
│   │   └── userService.ts        # User operations
│   ├── hooks/                    # Custom React hooks
│   │   └── useAuth.ts            # Auth hook
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # All type definitions
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Class name utility
│   │   └── constants.ts          # App constants
│   └── lib/                      # Library configurations
│       └── utils.ts              # CN utility
└── .env.local                    # Environment variables
```

## Features

### Authentication
- ✅ Email/password login via Firebase
- ✅ User registration
- ✅ Protected routes
- ✅ Automatic token refresh

### Dashboard
- ✅ Quick stats overview
- ✅ Daily challenges
- ✅ Recent essays
- ✅ Progress tracking

### Writing Practice
- ✅ Topic selection
- ✅ Timed writing sessions
- ✅ Word count tracking
- ✅ Auto-save drafts

### Progress Tracking
- ✅ Score analytics
- ✅ Writing frequency
- ✅ Skill breakdown
- ✅ Achievements

### Gamification
- ✅ XP system
- ✅ Level progression
- ✅ Streak tracking
- ✅ Achievement badges

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://localhost:7133/api
NEXT_PUBLIC_API_BASE_URL=https://localhost:7133
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vstep-writing-lab.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vstep-writing-lab
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vstep-writing-lab.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## State Management

The app uses Zustand for state management:

### useAuthStore
- User authentication state
- Login/logout actions
- Loading states

### useUserStore
- User profile data
- Target VSTEP level
- Progress statistics
- XP and levels

### useWritingStore
- Current writing session
- Timer state
- Word count
- Submit states

## API Integration

All API calls are made through service layers:

```typescript
import { essayService } from '@/services/essayService';

// Submit essay
const { essayId } = await essayService.submitEssay({
  topicId: '123',
  content: 'Essay content...',
  wordCount: 300,
  timeSpent: 2400,
});

// Get feedback
const feedback = await essayService.getFeedback(essayId);
```

## Component Examples

### Button Component
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
```

## Responsive Design

The application is fully responsive:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Color Scheme

```css
Primary: #2563EB (Blue)
Secondary: #22C55E (Green)
Accent: #F59E0B (Yellow/Amber)
Background: #F9FAFB (Light Gray)
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
