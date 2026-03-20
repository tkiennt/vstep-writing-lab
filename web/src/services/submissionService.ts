import api from './api';
import { SubmissionResponse, EssaySubmission, SubmissionListItemResponse } from '@/types';

export const submissionService = {
  // Submit an essay for grading
  async submit(submission: EssaySubmission): Promise<SubmissionResponse> {
    const response = await api.post<SubmissionResponse>('/submissions', submission);
    return response.data;
  },

  // Get submission by ID (used for results and polling)
  async getById(id: string): Promise<SubmissionResponse> {
    const response = await api.get<SubmissionResponse>(`/submissions/${id}`);
    return response.data;
  },

  // Get history of submissions for the current user
  async getHistory(limit: number = 20): Promise<SubmissionListItemResponse[]> {
    const response = await api.get<SubmissionListItemResponse[]>('/submissions', {
      params: { limit },
    });
    return response.data;
  },

  // Retry a failed submission
  async retry(id: string): Promise<SubmissionResponse> {
    const response = await api.post<SubmissionResponse>(`/submissions/${id}/retry`);
    return response.data;
  },
};
