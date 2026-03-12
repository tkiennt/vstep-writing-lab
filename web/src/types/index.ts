// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  targetLevel: VSTEPLevel;
  createdAt: Date;
  updatedAt: Date;
}

export type VSTEPLevel = 'B1' | 'B2' | 'C1';

// Essay Types
export interface Essay {
  id: string;
  userId: string;
  topicId: string;
  topicTitle: string;
  taskType: TaskType;
  content: string;
  wordCount: number;
  submittedAt: Date;
  score?: number;
  status: EssayStatus;
}

export type EssayStatus = 'draft' | 'submitted' | 'evaluated';

export type TaskType = 'opinion' | 'discussion' | 'problem-solution' | 'two-part';

// Feedback Types
export interface EssayFeedback {
  essayId: string;
  overallScore: number;
  bandDescriptor: BandDescriptor;
  breakdown: ScoreBreakdown;
  grammarErrors: GrammarError[];
  vocabularySuggestions: VocabularySuggestion[];
  improvedSentences: ImprovedSentence[];
  generalComments: string;
}

export interface ScoreBreakdown {
  taskAchievement: number;
  coherence: number;
  vocabulary: number;
  grammar: number;
}

export type BandDescriptor = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface GrammarError {
  originalText: string;
  errorType: string;
  suggestion: string;
  explanation: string;
  position: {
    start: number;
    end: number;
  };
}

export interface VocabularySuggestion {
  originalWord: string;
  suggestions: string[];
  context: string;
}

export interface ImprovedSentence {
  original: string;
  improved: string;
  explanation: string;
}

// Topic Types
export interface Topic {
  id: string;
  title: string;
  taskType: TaskType;
  prompt: string;
  instructions: string;
  wordLimit: number;
  timeLimit: number; // in minutes
  difficulty: VSTEPLevel;
  category: string;
}

// Progress Types
export interface UserProgress {
  totalEssays: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  totalXP: number;
  level: number;
  scoresByDate: ScoreEntry[];
  skillRadar: SkillData;
  weakSkills: WeakSkill[];
  achievements: Achievement[];
}

export interface ScoreEntry {
  date: string;
  score: number;
  topicId: string;
}

export interface SkillData {
  taskAchievement: number;
  coherence: number;
  vocabulary: number;
  grammar: number;
}

export interface WeakSkill {
  skill: string;
  errorCount: number;
  recommendation: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Writing Practice Types
export interface EssaySubmission {
  topicId: string;
  content: string;
  wordCount: number;
  timeSpent: number; // in seconds
}

export interface WritingSession {
  topicId: string;
  startTime: Date;
  content: string;
  wordCount: number;
  isCompleted: boolean;
}
