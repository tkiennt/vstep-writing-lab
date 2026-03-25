import api from '../api';

export interface AdminEssayDTO {
  submissionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  questionId: string;
  topicTitle: string;
  taskType: string;
  status: 'pending' | 'scored' | 'failed' | 'graded' | 'completed' | 'processing' | 'PHASE1COMPLETED';
  overallScore: number;
  createdAt: string;
  wordCount: number;
}

export const adminEssayService = {
  getAll: async () => {
    const response = await api.get<AdminEssayDTO[]>('/admin/essays');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<any>(`/admin/essays/${id}`);
    return response.data;
  },

  updateScore: async (id: string, score: number) => {
    await api.patch(`/admin/essays/${id}/score?score=${score}`);
  },

  delete: async (id: string) => {
    await api.delete(`/admin/essays/${id}`);
  }
};
