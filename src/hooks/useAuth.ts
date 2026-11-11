import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/auth.api';
import type { LoginPayload } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, clear, hasPermission } = useAuthStore();

  async function login(payload: LoginPayload) {
    const res = await authApi.login(payload);
    if (!res.status || !res.data) {
      throw new Error(res.message || 'Login failed');
    }
    setAuth(res.data.user, res.data.access_token, res.data.refresh_token);
    navigate('/dashboard', { replace: true });
  }

  async function logout() {
    const refresh = localStorage.getItem('cd_refresh_token') || '';
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // ignore — clear anyway
    }
    clear();
    navigate('/login', { replace: true });
  }

  return { user, isAuthenticated, login, logout, hasPermission };
}