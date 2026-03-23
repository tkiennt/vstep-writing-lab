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

export type EssayStatus = 'draft' | 'submitted' | 'evaluated' | 'pending' | 'scored' | 'failed';

export type TaskType = 'opinion' | 'discussion' | 'problem-solution' | 'two-part';

// Feedback Types
export interface EssayFeedback {
  summary: string;
  suggestions: string[];
  highlights: Highlight[];
}

export interface Highlight {
  text: string;
  issue: string;
  type: string;
}

export interface AiScore {
  taskFulfilment: number;
  organization: number;
  vocabulary: number;
  grammar: number;
  overall: number;
}

// Removed old breakdown types to avoid confusion

// Topic Types
export interface Topic {
  id: string;
  title: string;
  taskType: string;
  prompt: string;
  instructions: string;
  wordLimit: number;
  timeLimit: number; // in minutes
  difficulty: string;
  category: string;
  isActive: boolean;
}

export interface Question {
  questionId: string;
  taskType: string;
  category: string;
  title: string;
  instructions: string;
  requirements?: string;
  level: string;
  task?: TaskInfo;
  sentenceTemplates?: SentenceTemplate[];
}

export interface TaskInfo {
  taskId: string;
  name: string;
  type: string;
  duration: number;
  minWords: number;
  scoreWeight: number;
  description: string;
}

export interface SentenceTemplate {
  part: string;
  templates: string[];
}

// Exam Prompt Types (v2)
export interface ExamPrompt {
  id: string;
  taskType: string;
  cefrLevel: string;
  instruction: string;
  keyPoints: string[];
  topicCategory: string;
  topicKeyword: string;
  essayType: string;
  difficulty: number;
  isActive: boolean;
  usageCount: number;
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

export interface EssaySubmission {
  questionId: string;
  mode: 'practice' | 'guided' | 'exam';
  essayContent: string;
}

export interface SubmissionResponse {
  id: string;
  questionId: string;
  taskType: string;
  mode: string;
  essayContent: string;
  wordCount: number;
  belowMinWords: boolean;
  status: EssayStatus;
  aiScore?: AiScore;
  aiFeedback?: EssayFeedback;
  retryCount: number;
  createdAt: string;
  scoredAt?: string;
}

export interface SubmissionListItemResponse {
  id: string;
  questionId: string;
  questionTitle: string;
  taskType: string;
  mode: string;
  wordCount: number;
  belowMinWords: boolean;
  status: EssayStatus;
  overallScore?: number;
  createdAt: string;
}

export interface WritingSession {
  topicId: string;
  startTime: Date;
  content: string;
  wordCount: number;
  isCompleted: boolean;
}
