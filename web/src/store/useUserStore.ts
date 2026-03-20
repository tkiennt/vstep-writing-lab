import { create } from 'zustand';
import { User, UserProgress, VSTEPLevel } from '@/types';

interface UserState {
  userProfile: User | null;
  progress: UserProgress | null;
  targetLevel: VSTEPLevel | null;
  setUserProfile: (user: User) => void;
  setProgress: (progress: UserProgress) => void;
  setTargetLevel: (level: VSTEPLevel) => void;
  updateStreak: () => void;
  addXP: (xp: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userProfile: null,
  progress: null,
  targetLevel: null,
  setUserProfile: (user) => set({ userProfile: user, targetLevel: user.targetLevel }),
  setProgress: (progress) => set({ progress }),
  setTargetLevel: (level) => set({ targetLevel: level }),
  updateStreak: () => set((state) => ({
    progress: state.progress ? {
      ...state.progress,
      currentStreak: state.progress.currentStreak + 1,
      bestStreak: Math.max(state.progress.currentStreak + 1, state.progress.bestStreak),
    } : null,
  })),
  addXP: (xp) => set((state) => ({
    progress: state.progress ? {
      ...state.progress,
      totalXP: state.progress.totalXP + xp,
      level: calculateLevel(state.progress.totalXP + xp),
    } : null,
  })),
}));

// Helper function to calculate level based on XP
function calculateLevel(totalXP: number): number {
  const thresholds = [0, 500, 1500, 3000, 5000, 8000, 12000, 17000, 23000, 30000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXP >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}
