import api from './api';

export interface AdminUser {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface UpdateUserRequest {
  role?: string;
  isActive?: boolean;
}

export const adminUserService = {
  async getAllUsers(): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>('/admin/users');
    return Array.isArray(data) ? data : [];
  },

  async updateUser(userId: string, request: UpdateUserRequest): Promise<AdminUser> {
    const payload: Record<string, unknown> = {};
    if (request.role != null) payload.Role = request.role;
    if (request.isActive != null) payload.IsActive = request.isActive;

    const { data } = await api.patch<AdminUser>(`/admin/users/${userId}`, payload);
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },
};
