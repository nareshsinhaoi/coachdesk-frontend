import { apiClient } from './client';
import type { ApiResponse, Batch, BatchListParams, Pagination } from '@/types';

export const batchesApi = {
  list: async (params?: BatchListParams): Promise<{ data: Batch[]; pagination?: Pagination }> => {
    const { data } = await apiClient.get<ApiResponse<Batch[]>>('/batches', {
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

  get: async (publicId: string): Promise<Batch> => {
    const { data } = await apiClient.get<ApiResponse<Batch>>(`/batches/${publicId}`);
    return data.data;
  },

  create: async (payload: Partial<Batch>): Promise<Batch> => {
    const { data } = await apiClient.post<ApiResponse<Batch>>('/batches', payload);
    return data.data;
  },

  update: async (publicId: string, payload: Partial<Batch>): Promise<Batch> => {
    const { data } = await apiClient.put<ApiResponse<Batch>>(`/batches/${publicId}`, payload);
    return data.data;
  },

  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`/batches/${publicId}`);
  },
};
