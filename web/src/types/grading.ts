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
  essayId: string;
  taskType: 'task1' | 'task2';
  taskRelevance: TaskRelevanceResult;
  taskFulfilment: CriterionResult;
  organization: CriterionResult;
  vocabulary: CriterionResult;
  grammar: CriterionResult;
  totalScore: number; // 0-10
  cefrLevel: string; // "B1" | "B2" | "C1" | "C1+"
  vstepComparison: string;
  strengthsVi: string[];
  improvementsVi: string[];
  corrections: Correction[];
}

// ── Grading request payload ──────────────────────────────────
export interface GradingRequest {
  essayId: string;
  taskType: 'task1' | 'task2';
  prompt: string;
  essayText: string;
  wordCount: number;
  studentId: string;
}

// ── Firestore grading_results document ──────────────────────
export interface GradingResultDoc extends GradingResult {
  docId: string; // Firestore auto-ID
  studentId: string;
  examId: string;
  gradedAt: Date;
  essayText: string;
  wordCount: number;
  aiModel: string;
  isRelevant: boolean;
  relevanceScore: number;
  verdictVi: string;
  missingPointsVi: string[];
  offTopicSentences: string[];
  taskFulfilmentScore: number;
  organizationScore: number;
  vocabularyScore: number;
  grammarScore: number;
  feedbackByCategory: {
    taskFulfilment: CriterionResult;
    organization: CriterionResult;
    vocabulary: CriterionResult;
    grammar: CriterionResult;
  };
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
