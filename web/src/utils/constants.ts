// VSTEP Levels
export const VSTEP_LEVELS = {
  B1: { label: 'B1 (Intermediate)', color: 'bg-blue-500' },
  B2: { label: 'B2 (Upper Intermediate)', color: 'bg-green-500' },
  C1: { label: 'C1 (Advanced)', color: 'bg-purple-500' },
} as const;

// Task Types
export const TASK_TYPES = {
  opinion: 'Opinion Essay',
  discussion: 'Discussion Essay',
  'problem-solution': 'Problem-Solution Essay',
  'two-part': 'Two-Part Question',
} as const;

// Band Descriptors
export const BAND_DESCRIPTORS = {
  Beginner: { range: '0-4.9', color: 'text-red-500' },
  Intermediate: { range: '5.0-6.9', color: 'text-yellow-500' },
  Advanced: { range: '7.0-8.9', color: 'text-blue-500' },
  Expert: { range: '9.0-10.0', color: 'text-green-500' },
} as const;

// Score Colors
export const SCORE_COLORS = {
  low: 'text-red-500',
  medium: 'text-yellow-500',
  high: 'text-blue-500',
  excellent: 'text-green-500',
} as const;

// Navigation Items
export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Practice', href: '/practice', icon: 'pen-tool' },
  { label: 'History', href: '/history', icon: 'history' },
  { label: 'Progress', href: '/progress', icon: 'trending-up' },
  { label: 'Profile', href: '/profile', icon: 'user' },
] as const;

// Gamification
export const XP_REWARDS = {
  essayCompleted: 100,
  dailyChallenge: 50,
  weekStreak: 200,
  scoreImprovement: 75,
} as const;

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  500,    // Level 2
  1500,   // Level 3
  3000,   // Level 4
  5000,   // Level 5
  8000,   // Level 6
  12000,  // Level 7
  17000,  // Level 8
  23000,  // Level 9
  30000,  // Level 10
] as const;

// Time Limits (in minutes)
export const TIME_LIMITS = {
  B1: 40,
  B2: 40,
  C1: 40,
} as const;

// Word Limits
export const WORD_LIMITS = {
  minimum: 250,
  recommended: 300,
} as const;
