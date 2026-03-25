// ============================================================
// VSTEP Grader — Grading Types
// Import from @/types/grading  (don't mix with @/types/index)
// ============================================================

// ── Exam Prompt (Firestore: exam_prompts/{examId}) ─────────
export interface ExamPrompt {
  id: string;
  taskType: 'task1' | 'task2';
  cefrLevel: 'B1' | 'B2' | 'C1';
  instruction: string;
  keyPoints: string[];
  topicCategory: string;
  topicKeyword: string;
  essayType: string;
  difficulty: 1 | 2 | 3;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  suggestedChecklist?: string[];
  suggestedPhrases?: string[];
  suggestedStructures?: string[];
}

// ── Per-criterion result ────────────────────────────────────
export type BandLabel =
  | 'Xuất sắc'
  | 'Tốt'
  | 'Đạt yêu cầu'
  | 'Yếu'
  | 'Rất yếu';

export interface CriterionResult {
  score: number; // 0-10
  bandLabel: BandLabel;
  feedbackEn: string;
  feedbackVi: string;
  evidenceEn: string;
}

// ── API Responses ───────────────────────────────────────────
export interface ProgressResponse {
  totalEssays:          number;
  task1Count:           number;
  task2Count:           number;
  averageScoreTask1:    number;
  averageScoreTask2:    number;
  weightedOverallScore: number;
  streak:               number;
  scoreHistory: {
    id: string;
    score:        number;
    taskType:     string;
    date:         string;
  }[];
  averageBySkill: Record<string, number>;
  weakSkills:     string[];
  lastUpdatedAt:  string;
}

export interface SubmissionListItemResponse {
  id:   string;
  questionId:     string;
  questionTitle:  string;
  taskType:       string;
  mode:           string;
  wordCount:      number;
  belowMinWords:  boolean;
  status:         string;
  overallScore?:  number;
  summaryEn?:     string;
  summaryVi?:     string;
  createdAt:      string;
}

// ── Task relevance check ────────────────────────────────────
export interface TaskRelevanceResult {
  isRelevant: boolean;
  relevanceScore: number; // 0-10
  verdictVi: string;
  missingPointsVi: string[];
  offTopicSentencesEn: string[];
}

// ── Correction item ─────────────────────────────────────────
export interface Correction {
  original: string;
  corrected: string;
  reasonVi: string;
}

// ── Full grading result (API response) ──────────────────────
export interface GradingResult {
  score: {
    taskFulfilment: number;
    organization: number;
    vocabulary: number;
    grammar: number;
    overall: number;
  };
  summaryEn: string;
  summaryVi: string;
  summary: string; // Legacy
  suggestionsEn: string[];
  suggestionsVi: string[];
  suggestions: string[]; // Legacy
  annotations: Annotation[];
  sentenceAnalysis: SentenceAnalysis[];
  suggestedStructures: SuggestedStructure[];
  taskRelevance: TaskRelevanceResult;
  // NEW:
  id:                  string;
  sentenceFeedback:    SentenceFeedback[];
  improvementTracking?: ImprovementTracking;
  guideMode?:          GuideOutput;
  inlineSentenceImprovement?: SentenceFeedback[];
  roadmap?: {
    currentCefr?: string;
    targetCefr?: string;
    estimatedWeeks?: number;
    weekly_plan: {
      week: number;
      focus: string;
      tasks: string[];
      goal: string;
    }[];
  };
  mode:                "exam" | "practice" | "guide";
  status?:              string;
}

// ── Firestore grading_results document ──────────────────────
export interface GradingResultDoc extends GradingResult {
  id: string;
  submissionId: string;
  userUid: string;
  promptId: string;
  questionTitle: string;
  essayText: string;
  wordCount: number;
  cefrLevel: string;
  createdAt: any;
  gradedAt: any;
  totalScore: number;
  taskType: 'task1' | 'task2';
  isRelevant: boolean;
}

// ── Progress summary (Firestore: users/{uid}/progress/summary) ──
export interface ProgressSummary {
  totalSubmissions: number;
  avgScore: number;
  avgTaskFulfilment: number;
  avgOrganization: number;
  avgVocabulary: number;
  avgGrammar: number;
  weakestCriterion: string;
  strongestCriterion: string;
  trend: 'Improving' | 'Stable' | 'Declining';
  trendValue: number; // positive = up, negative = down
  currentCefr: string;
  vstepComparison: string;
  relevanceRate: number; // 0-100 (%)
  lastUpdated: Date;
}

// ── Criteria keys (for generic operations) ──────────────────
export type CriterionKey =
  | 'taskFulfilment'
  | 'organization'
  | 'vocabulary'
  | 'grammar';

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  taskFulfilment: 'Hoàn thành nhiệm vụ',
  organization: 'Tổ chức & Hành văn',
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
};

export const MIN_WORD_COUNT: Record<'task1' | 'task2', number> = {
  task1: 120,
  task2: 250,
};

export type AnnotationType = "grammar"|"vocab_weak"|"vocab_repeat"|"off_topic"|"strength"|"sentence";
export type AnnotationSeverity = "error"|"warning"|"info"|"good";

export interface Annotation {
  startIndex:  number;
  endIndex:    number;
  type:        AnnotationType;
  messageEn:   string;
  messageVi:   string;
  message:     string; // Legacy
  suggestionEn: string | null;
  suggestionVi: string | null;
  suggestion:  string | null; // Legacy
  severity:    AnnotationSeverity;
  isSentence?: boolean;
}

export interface SentenceAnalysis {
  sentence:        string;
  quality:         "strong" | "adequate" | "weak";
  feedbackVi:      string;
  improvedVersion: string | null;
  structureUsed:   string;
}

// NEW: Matching Backend Structures
export interface SentenceFeedback {
  sentence:      string;
  isGood:        boolean;
  issueType:     "grammar" | "vocab" | "coherence" | "task" | "none";
  explanationEn: string;
  explanationVi: string;
  explanation:   string; // Legacy
  suggestionEn:  string;
  suggestionVi:  string;
  suggestion:    string; // Legacy
}

export interface ImprovementTracking {
  improved:    string[];
  notImproved: string[];
  newIssues:   string[];
}

export interface GuideOutput {
  outline: {
    introduction: string[];
    body:         string[];
    conclusion:   string[];
  };
  sentenceSuggestions: {
    introduction: string[];
    body:         string[];
    conclusion:   string[];
  };
}
export interface SuggestedStructure {
  structure:  string;
  example:    string;
  usageTipEn: string;
  usageTipVi: string;
  usageTip:   string; // Legacy
}

export interface LearningRoadmapItem {
  criterion:    string;
  currentScore: number;
  targetScore:  number;
  weeklyGoal:   string;
  resources:    string[];
}

export interface DraftState {
  examId:        string;
  taskType:      "task1" | "task2";
  essayText:     string;
  wordCount:     number;
  mode:          "free" | "guided";
  guidedState?:  GuidedState;
  elapsedSeconds:number;
  isPaused:      boolean;
  updatedAt?:    any; // FieldValue or Date
}

export interface GuidedState {
  currentStep:    number;
  outline:        OutlineStep[];
  completedSteps: number[];
  hints:          Record<number, string>;
}

export interface OutlineStep {
  index: number;
  title: string;
  hint: string;
}

export interface UserHistoryType {
  weaknesses: string[];
  pastScores: number[];
  level:      string;
}

