import { api } from './api';
import type { FullAnalysisResponse } from '../types/gradingApi';

/** Khớp `GradeEssayRequest` backend — camelCase JSON */
export interface GradeEssayPayload {
  userUid: string;
  promptId: string;
  content: string;
  taskType: string;
}

/** Gemini có thể mất >30s — tránh timeout sớm (mặc định axios 30s). */
const GRADE_TIMEOUT_MS = 120_000;

export const gradingService = {
  async gradeEssay(payload: GradeEssayPayload): Promise<FullAnalysisResponse> {
    const { data } = await api.post<FullAnalysisResponse>('/grading/grade', payload, {
      timeout: GRADE_TIMEOUT_MS,
    });
    return data;
  },
};
