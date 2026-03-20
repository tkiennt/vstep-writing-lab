# VSTEP Writing Lab - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd web
npm install
```

### Step 2: Configure Environment

The `.env.local` file is already configured with Firebase credentials. You can modify if needed:

```env
NEXT_PUBLIC_API_URL=https://localhost:7133/api
NEXT_PUBLIC_API_BASE_URL=https://localhost:7133
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBEPHGDf5nUhMkD4U3qinSpVdxoVpkdMfg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vstep-writing-lab.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vstep-writing-lab
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vstep-writing-lab.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=958279733063
NEXT_PUBLIC_FIREBASE_APP_ID=1:958279733063:web:ef7e0d43d24ddf414b0662
```

### Step 3: Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** (or 3001)

## 📱 Available Pages & Routes

### Public Routes
- `/` - Landing page with features and testimonials
- `/login` - User login
- `/register` - User registration

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/practice` - Browse writing topics
- `/practice/[topicId]` - Writing editor (TODO)
- `/history` - Essay history
- `/progress` - Progress analytics
- `/profile` - User settings
- `/onboarding` - First-time user setup

## 🔑 Test the Application

### Create a New Account
1. Visit http://localhost:3000
2. Click "Get Started Free" or "Sign Up"
3. Fill in registration form:
   - Name: Your name
   - Email: test@example.com
   - Password: password123
4. Accept terms and click "Create Account"

### Complete Onboarding
1. After registration, you'll be redirected to onboarding
2. Select your target VSTEP level (B1, B2, or C1)
3. Click "Continue to Dashboard"

### Explore Dashboard
1. View your stats (currently 0 as new user)
2. See daily challenge card
3. Check progress overview
4. Navigate using sidebar:
   - Dashboard
   - Practice
   - History
   - Progress
   - Profile

### Try Practice Mode
1. Click "Practice" in sidebar
2. Browse available topics
3. Topics show:
   - Difficulty level (B1/B2/C1)
   - Task type
   - Word limit
   - Time limit

## 🎨 UI Components Included

### Authentication Forms
- ✅ Login form with email/password
- ✅ Registration form with validation
- ✅ Error message display
- ✅ Loading states

### Navigation
- ✅ Desktop sidebar (fixed, 64px width)
- ✅ Mobile header with hamburger menu
- ✅ Active route highlighting
- ✅ User info in sidebar

### Cards
- ✅ Stat cards (4 types)
- ✅ Topic cards
- ✅ Info cards
- ✅ Empty state cards

### Buttons
- ✅ Primary (blue)
- ✅ Secondary (outline)
- ✅ Ghost
- ✅ Disabled states

## 🛠️ State Management Examples

### Access User Data
```typescript
import { useAuthStore } from '@/store/useAuthStore';

const { user, isAuthenticated } = useAuthStore();
console.log(user?.name);
```

### Access Writing Session
```typescript
import { useWritingStore } from '@/store/useWritingStore';

const { startSession, updateContent } = useWritingStore();
startSession('topic-id');
```

### Access User Progress
```typescript
import { useUserStore } from '@/store/useUserStore';

const { progress, addXP } = useUserStore();
addXP(100); // Award XP
```

## 📡 API Integration Examples

### Submit Essay
```typescript
import { essayService } from '@/services/essayService';

const result = await essayService.submitEssay({
  topicId: '123',
  content: 'Your essay here...',
  wordCount: 300,
  timeSpent: 2400,
});
```

### Get Feedback
```typescript
const feedback = await essayService.getFeedback(essayId);
console.log(feedback.overallScore);
```

### Load User Progress
```typescript
import { userService } from '@/services/userService';

const progress = await userService.getUserProgress(userId);
```

## 🎯 What Works Now

### ✅ Fully Functional
- User registration via Firebase
- User login/logout
- Protected routes
- Dashboard display
- Topic browsing
- Responsive design
- State management
- Token-based auth

### ⏳ Needs Backend
- Essay submission
- AI feedback
- Score calculation
- Progress charts
- History listing
- Real statistics

## 🔧 Customization

### Change Colors
Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: "#2563EB", // Change this
  },
  secondary: {
    DEFAULT: "#22C55E", // Change this
  },
}
```

### Add New Pages
1. Create folder in `app/(dashboard)/your-page/`
2. Add `page.tsx` file
3. Update navigation in `app/(dashboard)/layout.tsx`

### Add New Components
1. Create in `src/components/features/`
2. Export from folder
3. Import where needed

## 📝 Code Style

### Component Naming
- PascalCase for components: `TopicCard.tsx`
- camelCase for utilities: `utils.ts`
- Prefix with `use` for hooks: `useAuth.ts`

### File Structure
```typescript
// Imports
import React from 'react';
import { useState } from 'react';

// Types
interface Props { ... }

// Component
export default function MyComponent() {
  return <div>...</div>;
}

// Helper components
function SubComponent() { ... }
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or just use the port Next.js suggests (3001, 3002, etc.)
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check types
npx tsc --noEmit
```

## 📚 Learn More

### Next.js Documentation
https://nextjs.org/docs

### TailwindCSS Documentation
https://tailwindcss.com/docs

### ShadCN UI
https://ui.shadcn.com

### Zustand
https://github.com/pmndrs/zustand

## 🎉 Success Indicators

You know it's working when:
- ✅ No terminal errors after `npm run dev`
- ✅ Can access http://localhost:3000
- ✅ Can register new account
- ✅ Can login after registration
- ✅ Can see dashboard after login
- ✅ Can navigate between pages
- ✅ Sidebar shows correct active state

## 💡 Pro Tips

1. **Use the browser DevTools** to inspect components
2. **Check Console** for any errors or warnings
3. **Test responsive design** by resizing browser window
4. **Use React DevTools** to see component tree
5. **Monitor Network tab** for API calls (when backend is ready)

---

**Happy Coding!** 🚀

If you encounter any issues, check the console errors and refer to this guide.
