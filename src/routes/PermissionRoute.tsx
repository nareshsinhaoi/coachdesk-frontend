import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  permission: string;
  children?: React.ReactNode;
}

export default function PermissionRoute({ permission, children }: Props) {
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
