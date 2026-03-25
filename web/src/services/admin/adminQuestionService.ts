import api from '../api';

export interface QuestionDTO {
  questionId: string;
  title: string;
  taskType: string;
  category: string;
  level: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const adminQuestionService = {
  getAll: async (): Promise<QuestionDTO[]> => {
    const response = await api.get('/admin/questions');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/admin/questions', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/questions/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/questions/${id}`);
    return response.data;
  },
  restore: async (id: string) => {
    const response = await api.patch(`/admin/questions/${id}/restore`);
    return response.data;
  }
};
