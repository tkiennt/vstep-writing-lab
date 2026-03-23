import { api } from './api';
import type { SubmissionHistoryItem } from '../types/submission';

export const submissionService = {
  async getHistory(limit = 20): Promise<SubmissionHistoryItem[]> {
    const { data } = await api.get<SubmissionHistoryItem[]>('/submissions', {
      params: { limit },
    });
    return Array.isArray(data) ? data : [];
  },
};
