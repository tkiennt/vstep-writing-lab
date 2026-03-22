/** Khớp `FullAnalysisResponse` từ API `POST /api/grading/grade` (JSON camelCase). */

export interface CriterionScoreDto {
  score: number;
  bandLabel: string;
  feedbackEn: string;
  feedbackVi: string;
  evidenceEn: string;
}

export interface TaskRelevanceDto {
  isRelevant: boolean;
  score: number;
  verdicts: string[];
  missingPoints: string[];
  offTopicSentences: string[];
}

export interface InlineHighlightDto {
  type: string;
  quote: string;
  issue: string;
  issueVi: string;
  fix: string;
  category: string;
}

export interface WeeklyPlanTaskDto {
  week: number;
  focus: string;
  tasks: string[];
  goal: string;
}

export interface GradingRoadmapDto {
  currentLevel: string;
  targetLevel: string;
  estimatedWeeks: number;
  weeklyPlan: WeeklyPlanTaskDto[];
}

export interface FullAnalysisResponse {
  id?: string;
  studentId?: string;
  examId?: string;
  taskType: string;
  gradedAt?: string;
  totalScore: number;
  cefrLevel: string;
  vstepComparison?: string;
  relevance?: TaskRelevanceDto | null;
  taskFulfilment: CriterionScoreDto;
  organization: CriterionScoreDto;
  vocabulary: CriterionScoreDto;
  grammar: CriterionScoreDto;
  strengthsVi: string[];
  improvementsVi: string[];
  corrections: {
    original: string;
    corrected: string;
    reasonEn: string;
    reasonVi: string;
  }[];
  inlineHighlights: InlineHighlightDto[];
  recommendedStructures: {
    structureName: string;
    example: string;
    whyUseItVi: string;
  }[];
  rewriteSamples: {
    original: string;
    rewritten: string;
    explanationVi: string;
  }[];
  roadmap?: GradingRoadmapDto | null;
  modelUsed?: string;
}
