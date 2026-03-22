/** Outline theo đề — API `GET /api/v2/ExamPrompts/{id}/outline` (Gemini) */
export interface OutlineStep {
  index: number;
  title: string;
  hint: string;
}

/** Khớp web `ExamPrompt` — API `/api/v2/ExamPrompts` */
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
