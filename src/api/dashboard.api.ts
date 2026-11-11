import apiClient from './client';
import type { ApiResponse, DashboardStats } from '@/types';

export const dashboardApi = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard');
    return data;
  },
};