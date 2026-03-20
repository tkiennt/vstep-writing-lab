import { create } from 'zustand';
import { WritingSession } from '@/types';

interface WritingState {
  currentSession: WritingSession | null;
  timeElapsed: number; // in seconds
  wordCount: number;
  isSubmitting: boolean;
  startSession: (topicId: string) => void;
  updateContent: (content: string, wordCount: number) => void;
  updateTimeElapsed: (seconds: number) => void;
  completeSession: () => void;
  resetSession: () => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useWritingStore = create<WritingState>((set) => ({
  currentSession: null,
  timeElapsed: 0,
  wordCount: 0,
  isSubmitting: false,
  startSession: (topicId) => set({
    currentSession: {
      topicId,
      startTime: new Date(),
      content: '',
      wordCount: 0,
      isCompleted: false,
    },
    timeElapsed: 0,
    wordCount: 0,
    isSubmitting: false,
  }),
  updateContent: (content, wordCount) => set((state) => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      content,
      wordCount,
    } : null,
    wordCount,
  })),
  updateTimeElapsed: (seconds) => set({ timeElapsed: seconds }),
  completeSession: () => set((state) => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      isCompleted: true,
    } : null,
  })),
  resetSession: () => set({
    currentSession: null,
    timeElapsed: 0,
    wordCount: 0,
    isSubmitting: false,
  }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
}));
