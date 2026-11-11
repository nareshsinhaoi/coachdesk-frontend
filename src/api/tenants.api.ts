import { apiClient } from './client';

export const tenantsApi = {
  list: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/super-admin/tenants', { params });
    return data;
  },
};