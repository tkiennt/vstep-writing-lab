import api from '../api';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export const adminUserService = {
  getAll: async (): Promise<UserDTO[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getById: async (id: string): Promise<UserDTO> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  update: async (id: string, request: { role?: string; status?: string }) => {
    const response = await api.patch(`/admin/users/${id}`, request);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }
};
