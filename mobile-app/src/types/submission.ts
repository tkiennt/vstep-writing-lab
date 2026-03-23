export type SubmissionHistoryItem = {
  submissionId: string;
  questionId: string;
  questionTitle: string;
  taskType: string;
  mode: string;
  wordCount: number;
  belowMinWords: boolean;
  status: string;
  overallScore: number | null;
  createdAt: string;
};
