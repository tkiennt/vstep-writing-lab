import api from '../api';

export interface AnalyticsDTO {
  totalUsers: number;
  totalEssays: number;
  totalGradedSuccessfully: number;
  totalFailed: number;
  pendingQueue: number;
  avgResponseTime: string;
  tokenUsagePercent: number;
  hourlyStats: {
    hour: string;
    submissions: number;
    graded: number;
  }[];
}

export interface AiLogDTO {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  topicTitle: string;
  status: 'GRADED' | 'PROCESSING' | 'FAILED';
  errorMessage?: string;
}

export const adminAnalyticsService = {
  getAnalytics: async (): Promise<AnalyticsDTO> => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
  getAiLogs: async (from?: string, to?: string): Promise<AiLogDTO[]> => {
    const response = await api.get('/admin/ai-logs', { params: { from, to } });
    return response.data;
  }
};
