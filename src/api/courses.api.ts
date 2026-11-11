import { apiClient } from './client';
import type { ApiResponse, Course, CourseListParams, Pagination } from '@/types';

export const coursesApi = {
  list: async (params?: CourseListParams): Promise<{ data: Course[]; pagination?: Pagination }> => {
    const { data } = await apiClient.get<ApiResponse<Course[]>>('/courses', {
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

  create: async (payload: Partial<Course>): Promise<Course> => {
    const { data } = await apiClient.post<ApiResponse<Course>>('/courses', payload);
    return data.data;
  },

  update: async (publicId: string, payload: Partial<Course>): Promise<Course> => {
    const { data } = await apiClient.put<ApiResponse<Course>>(`/courses/${publicId}`, payload);
    return data.data;
  },

  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`/courses/${publicId}`);
  },
};
