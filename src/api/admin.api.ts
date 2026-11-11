import { apiClient } from './client';
import type {
  ApiResponse, Branch, BranchPayload, StaffUser, UserFormOptions, InstituteSettings,
} from '@/types';

export const branchesApi = {
  list: async (): Promise<Branch[]> => {
    const { data } = await apiClient.get<ApiResponse<Branch[]>>('/branches/all');
    return data.data || [];
  },

  create: async (payload: BranchPayload): Promise<Branch> => {
    const { data } = await apiClient.post<ApiResponse<Branch>>('/branches/all', payload);
    return data.data;
  },

  update: async (publicId: string, payload: Partial<BranchPayload>): Promise<Branch> => {
    const { data } = await apiClient.put<ApiResponse<Branch>>(`/branches/all/${publicId}`, payload);
    return data.data;
  },

  remove: async (publicId: string): Promise<void> => {
    await apiClient.delete(`/branches/all/${publicId}`);
  },
};

export const usersApi = {
  list: async (params?: { search?: string; status?: string; page?: number; perPage?: number }):
    Promise<{ data: StaffUser[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
    const { data } = await apiClient.get<ApiResponse<StaffUser[]>>('/users', { params });
    return { data: data.data || [], pagination: data.pagination };
  },

  formOptions: async (): Promise<UserFormOptions> => {
    const { data } = await apiClient.get<ApiResponse<UserFormOptions>>('/users/form-options');
    return data.data;
  },

  create: async (payload: {
    name: string; email: string; phone?: string; role_id: number; branch_id?: number | null;
  }): Promise<{ public_id: string; temp_password: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ public_id: string; temp_password: string }>>('/users', payload);
    return data.data;
  },

  update: async (publicId: string, payload: {
    name?: string; email?: string; phone?: string | null; status?: string;
    role_id?: number; branch_id?: number | null;
  }): Promise<void> => {
    await apiClient.put(`/users/${publicId}`, payload);
  },

  resetPassword: async (publicId: string): Promise<{ temp_password: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ temp_password: string }>>(`/users/${publicId}/reset-password`);
    return data.data;
  },
};

export const settingsApi = {
  get: async (): Promise<InstituteSettings> => {
    const { data } = await apiClient.get<ApiResponse<InstituteSettings>>('/settings');
    return data.data;
  },

  save: async (payload: {
    tenant?: Partial<InstituteSettings['tenant']>;
    settings?: Record<string, unknown>;
  }): Promise<InstituteSettings> => {
    const { data } = await apiClient.put<ApiResponse<InstituteSettings>>('/settings', payload);
    return data.data;
  },
};
