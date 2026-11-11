import { useAuthStore } from '@/stores/auth.store';

export function useTenant() {
  const user = useAuthStore((s) => s.user);
  return {
    tenantId: user?.tenant_id ?? (user as any)?.tenantId ?? null,
    branchId: user?.branch_id ?? (user as any)?.branchId ?? null,
  };
}