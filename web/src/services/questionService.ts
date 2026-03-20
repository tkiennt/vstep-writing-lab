import api from './api';
import { Question, ExamPrompt } from '@/types';

export const questionService = {
  // Get all questions with optional filters
  async getAll(taskType?: string, level?: string): Promise<Question[]> {
    const response = await api.get<Question[]>('/questions', {
      params: { taskType, level },
    });
    return response.data;
  },

  // Get a specific question by ID
  async getById(id: string, mode?: string): Promise<Question> {
    const response = await api.get<Question>(`/questions/${id}`, {
      params: { mode },
    });
    return response.data;
  },

  // --- v2 Exam Prompts ---
  async getExamPrompts(taskType?: string, cefrLevel?: string): Promise<ExamPrompt[]> {
    const response = await api.get<ExamPrompt[]>('/v2/ExamPrompts', {
      params: { taskType, cefrLevel },
    });
    return response.data;
  },

  async getExamPromptById(id: string): Promise<ExamPrompt> {
    const response = await api.get<ExamPrompt>(`/v2/ExamPrompts/${id}`);
    return response.data;
  },
};
