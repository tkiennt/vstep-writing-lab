import api from './api';
import { Essay, EssayFeedback, EssaySubmission, Topic, ApiResponse } from '@/types';

export const essayService = {
  // Submit essay for AI evaluation
  async submitEssay(submission: EssaySubmission): Promise<{ essayId: string }> {
    const response = await api.post<ApiResponse<{ essayId: string }>>('/essays/submit', submission);
    return response.data.data;
  },

  // Get AI feedback for an essay
  async getFeedback(essayId: string): Promise<EssayFeedback> {
    const response = await api.get<ApiResponse<EssayFeedback>>(`/essays/${essayId}/feedback`);
    return response.data.data;
  },

  // Get all essays by user
  async getHistory(): Promise<Essay[]> {
    const response = await api.get<ApiResponse<Essay[]>>('/essays/history');
    return response.data.data;
  },

  // Get specific essay
  async getEssayById(essayId: string): Promise<Essay> {
    const response = await api.get<ApiResponse<Essay>>(`/essays/${essayId}`);
    return response.data.data;
  },

  // Save draft
  async saveDraft(topicId: string, content: string, wordCount: number): Promise<void> {
    await api.post('/essays/draft', { topicId, content, wordCount });
  },

  // Get draft by topic
  async getDraft(topicId: string): Promise<{ content: string; wordCount: number } | null> {
    const response = await api.get<ApiResponse<{ content: string; wordCount: number }>>(`/essays/draft/${topicId}`);
    return response.data.data;
  },

  // Delete draft
  async deleteDraft(topicId: string): Promise<void> {
    await api.delete(`/essays/draft/${topicId}`);
  },
};

// Topic service
export const topicService = {
  // Get all topics
  async getAllTopics(): Promise<Topic[]> {
    const response = await api.get<ApiResponse<Topic[]>>('/topics');
    return response.data.data;
  },

  // Get topic by ID
  async getTopicById(topicId: string): Promise<Topic> {
    const response = await api.get<ApiResponse<Topic>>(`/topics/${topicId}`);
    return response.data.data;
  },

  // Get random topic for practice
  async getRandomTopic(difficulty?: 'B1' | 'B2' | 'C1'): Promise<Topic> {
    const response = await api.get<ApiResponse<Topic>>('/topics/random', {
      params: { difficulty },
    });
    return response.data.data;
  },
};
