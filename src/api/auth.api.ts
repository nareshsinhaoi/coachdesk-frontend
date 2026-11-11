import apiClient from './client';
import type { ApiResponse, AuthTokens, LoginPayload, User } from '@/types';

export const authApi = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthTokens>> {
    const { data } = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload);
    return data;
  },

  async me(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken });
  },
};