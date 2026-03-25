import api from '../api';

export interface AiLogDTO {
  logId: string;
  submissionId: string;
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: string;
}

export interface AiStatsDTO {
  totalCalls: number;
  averageLatencyMs: number;
  totalTokens: number;
  errorCount: number;
  modelUsage: Record<string, number>;
}

export const aiMonitoringService = {
  getLogs: async (count: number = 50) => {
    const response = await api.get<AiLogDTO[]>(`/admin/ai-monitor/logs?count=${count}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<AiStatsDTO>('/admin/ai-monitor/stats');
    return response.data;
  }
};
