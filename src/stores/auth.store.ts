import { create } from 'zustand';
import type { User } from '@/types';

export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.isSuperAdmin === true || user.is_super_admin === true || user.is_super_admin === 1) return true;
  if (user.tenant_id === null || user.tenant_id === undefined) return true;
  const roleStr = String(user.role || '').toLowerCase();
  if (roleStr === 'super_admin' || roleStr === 'superadmin') return true;
  if (user.roles?.some((r) => ['super_admin', 'superadmin'].includes(r.toLowerCase()))) return true;
  return false;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  hydrate: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (user, access, refresh) => {
    localStorage.setItem('cd_access_token', access);
    localStorage.setItem('cd_refresh_token', refresh);
    localStorage.setItem('cd_user', JSON.stringify(user));
    set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('cd_user', JSON.stringify(user));
    set({ user });
  },

  clear: () => {
    localStorage.removeItem('cd_access_token');
    localStorage.removeItem('cd_refresh_token');
    localStorage.removeItem('cd_user');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    const access = localStorage.getItem('cd_access_token');
    const refresh = localStorage.getItem('cd_refresh_token');
    const userRaw = localStorage.getItem('cd_user');
    if (access && userRaw) {
      try {
        const user = JSON.parse(userRaw) as User;
        set({ user, accessToken: access, refreshToken: refresh || null, isAuthenticated: true });
      } catch {
        get().clear();
      }
    }
  },

  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user) return false;

    // Super Admin has all permissions
    if (isSuperAdmin(user)) return true;

    // Check roles
    const roleStr = String(user.role || '').toLowerCase();
    const rolesList = (user.roles || []).map((r) => String(r).toLowerCase());

    const isOwnerOrAdmin =
      !roleStr ||
      roleStr === 'owner' ||
      roleStr === 'admin' ||
      roleStr === 'institute_admin' ||
      rolesList.includes('owner') ||
      rolesList.includes('admin') ||
      rolesList.includes('institute_admin');

    if (isOwnerOrAdmin) return true;

    // Wildcard permissions
    if ((user.permissions || []).includes('*')) return true;

    // Explicit permission match
    if ((user.permissions || []).includes(permission)) return true;

    // Default to true for standard modules if permissions array is not strictly configured
    if (!user.permissions || user.permissions.length === 0) {
      return true;
    }

    return false;
  },
}));

// Hydrate auth state on startup
useAuthStore.getState().hydrate();
