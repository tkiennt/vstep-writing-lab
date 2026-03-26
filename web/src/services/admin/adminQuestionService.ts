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
    return (response.data as any[]).map(q => {
      // Backend MapToResponse already handles field fallbacks.
      // These are the camelCase JSON keys from QuestionResponse:
      const title = q.title || q.scenario || q.questionId || '';
      const status = q.isActive === false ? 'inactive' : 'active';
      return {
        questionId: q.questionId ?? '',
        title,
        taskType:  q.taskType  ?? '',
        category:  q.category  ?? '',
        level:     q.level     ?? 'B1',
        status,
        createdAt: q.createdAt ?? '',
        updatedAt: q.updatedAt ?? '',
        content:   q.instructions ?? q.instruction ?? q.scenario ?? '',
      } as QuestionDTO;
    });
  },
  create: async (data: any) => {
    // Map frontend form fields to backend CreateQuestionRequest fields
    const payload = {
      taskType:     data.taskType     || 'task1',
      category:     data.category     || 'General',
      title:        data.title        || '',
      instructions: data.instructions || data.content || '',
      requirements: data.requirements || [],
      level:        data.level        || 'B1',
    };
    const response = await api.post('/admin/questions', payload);
    return response.data;
  },
  update: async (id: string, data: any) => {
    // Map frontend form fields to backend UpdateQuestionRequest fields
    const payload = {
      title:        data.title        || undefined,
      instructions: data.instructions || data.content || undefined,
      requirements: data.requirements || undefined,
      level:        data.level        || undefined,
      isActive:     data.isActive,
    };
    const response = await api.patch(`/admin/questions/${id}`, payload);
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
