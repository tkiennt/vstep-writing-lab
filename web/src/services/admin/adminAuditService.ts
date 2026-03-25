import api from '../api';

export interface AuditLogDTO {
  id: string;
  userId: string;
  adminEmail: string;
  action: string;
  entityId: string;
  entityType: string;
  status: string;
  ipAddress: string;
  userAgent: string;
  beforeData?: string;
  afterData?: string;
  errorMessage?: string;
  timestamp: string;
}

export const adminAuditService = {
  getLogs: async (count: number = 100) => {
    const response = await api.get<AuditLogDTO[]>(`/admin/audit/logs?count=${count}`);
    return response.data;
  }
};
