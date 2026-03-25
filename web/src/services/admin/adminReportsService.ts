import api from '../api';

export interface DailyTrendDTO {
  date: string;
  count: number;
  avgScore: number;
}

export interface ScoreBucketDTO {
  label: string;
  count: number;
}

export interface AiTrendDTO {
  date: string;
  totalTokens: number;
  avgLatencyMs: number;
  successRate: number;
}

export const adminReportsService = {
  getTrends: async (days: number = 30) => {
    const response = await api.get<DailyTrendDTO[]>(`/admin/reports/trends?days=${days}`);
    return response.data;
  },

  getDistribution: async () => {
    const response = await api.get<ScoreBucketDTO[]>('/admin/reports/distribution');
    return response.data;
  },

  getAiTrends: async (days: number = 30) => {
    const response = await api.get<AiTrendDTO[]>(`/admin/reports/ai-trends?days=${days}`);
    return response.data;
  },

  exportCsv: async () => {
    const response = await api.get('/admin/reports/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `submissions_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
