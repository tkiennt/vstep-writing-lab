import api from '../api';

export interface UserDTO {
  id: string;
  userId?: string; // Backend uses UserId in response
  email: string;
  fullName?: string;
  displayName?: string; // Backend uses DisplayName
  role: string;
  status: 'active' | 'banned';
  isActive?: boolean; // Backend uses IsActive
  submissionCount?: number;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  displayName: string;
  role: string;
}

export const adminUserService = {
  getAll: async () => {
    const response = await api.get<any[]>('/admin/users');
    return response.data.map(u => ({
      id: u.userId,
      email: u.email,
      fullName: u.displayName,
      role: u.role,
      status: u.isActive ? 'active' : 'banned',
      submissionCount: u.submissionCount || 0,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    })) as UserDTO[];
  },

  create: async (request: CreateUserRequest) => {
    const response = await api.post('/admin/users', request);
    return response.data;
  },

  update: async (id: string, request: Partial<UserDTO>) => {
    // Map status back to isActive for backend
    const backendRequest: any = { ...request };
    if (request.status) {
      backendRequest.isActive = request.status === 'active';
    }
    const response = await api.patch(`/admin/users/${id}`, backendRequest);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  }
};
