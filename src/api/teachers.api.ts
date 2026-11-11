import { apiClient } from './client';
import type { ApiResponse, Teacher, TeacherListParams, Pagination } from '@/types';

export const teachersApi = {
  list: async (params?: TeacherListParams): Promise<{ data: Teacher[]; pagination?: Pagination }> => {
    const { data } = await apiClient.get<ApiResponse<Teacher[]>>('/teachers', {
      params: {
        perPage: params?.perPage ?? 100,
        ...params,
      },
    });
    return {
      data: data.data || [],
      pagination: data.pagination,
    };
  },

  get: async (publicId: string): Promise<Teacher> => {
    const { data } = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${publicId}`);
    return data.data;
  },

  create: async (payload: Partial<Teacher>): Promise<Teacher> => {
    const { data } = await apiClient.post<ApiResponse<Teacher>>('/teachers', payload);
    return data.data;
  },

  update: async (publicId: string, payload: Partial<Teacher>): Promise<Teacher> => {
    const { data } = await apiClient.put<ApiResponse<Teacher>>(`/teachers/${publicId}`, payload);
    return data.data;
  },

  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`/teachers/${publicId}`);
  },
};

