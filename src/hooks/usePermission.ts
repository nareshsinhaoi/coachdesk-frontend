import { useAuthStore } from '@/stores/auth.store';

export function usePermission(permission: string): boolean {
  return useAuthStore((s) => s.hasPermission(permission));
}