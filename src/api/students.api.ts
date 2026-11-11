import apiClient from './client';
import type { ApiResponse, Student, Pagination } from '@/types';

interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const studentsApi = {
  async list(params: StudentListParams = {}): Promise<{ data: Student[]; pagination: Pagination }> {
    const { data } = await apiClient.get<ApiResponse<Student[]>>('/students', { params });
    return { data: data.data, pagination: data.pagination as Pagination };
  },

  async get(publicId: string): Promise<Student> {
    const { data } = await apiClient.get<ApiResponse<Student>>(`/students/${publicId}`);
    return data.data;
  },
};