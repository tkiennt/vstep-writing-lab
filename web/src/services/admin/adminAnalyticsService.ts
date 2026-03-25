import api from '../api';

export const adminAnalyticsService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
  getAiLogs: async (from?: string, to?: string) => {
    const response = await api.get('/admin/ai-usage-logs', { params: { from, to } });
    return response.data;
  }
};
