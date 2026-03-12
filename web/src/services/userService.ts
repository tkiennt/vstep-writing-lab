import api from './api';
import { User, UserProgress, ApiResponse } from '@/types';

export const userService = {
  // Get user profile
  async getUserProfile(uid: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${uid}`);
    return response.data.data;
  },

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${uid}`, data);
    return response.data.data;
  },

  // Set target VSTEP level
  async setTargetLevel(uid: string, targetLevel: 'B1' | 'B2' | 'C1'): Promise<void> {
    await api.put(`/users/${uid}/target-level`, { targetLevel });
  },

  // Get user progress
  async getUserProgress(uid: string): Promise<UserProgress> {
    const response = await api.get<ApiResponse<UserProgress>>(`/users/${uid}/progress`);
    return response.data.data;
  },

  // Get user statistics
  async getUserStatistics(uid: string): Promise<{
    totalEssays: number;
    averageScore: number;
    currentStreak: number;
    bestStreak: number;
    totalXP: number;
    level: number;
  }> {
    const response = await api.get<ApiResponse<any>>(`/users/${uid}/statistics`);
    return response.data.data;
  },
};
