import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionRoute from './PermissionRoute';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginPage from '@/features/auth/LoginPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import RegisterPage from '@/features/auth/RegisterPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import StudentsPage from '@/features/students/StudentsPage';
import CoursesPage from '@/features/courses/CoursesPage';
import BatchesPage from '@/features/batches/BatchesPage';
import TeachersPage from '@/features/teachers/TeachersPage';
import TenantsPage from '@/features/super-admin/TenantsPage';
import PlansPage from '@/features/super-admin/PlansPage';
import SubscriptionsPage from '@/features/super-admin/SubscriptionsPage';
import SupportPage from '@/features/super-admin/SupportPage';
import AuditLogsPage from '@/features/super-admin/AuditLogsPage';
import AttendancePage from '@/features/attendance/AttendancePage';
import FeesPage from '@/features/fees/FeesPage';
import ExamsPage from '@/features/exams/ExamsPage';
import ReportsPage from '@/features/reports/ReportsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import BranchesPage from '@/features/branches/BranchesPage';
import UsersPage from '@/features/users/UsersPage';
import SettingsPage from '@/features/settings/SettingsPage';
import ModulePlaceholderPage from '@/components/common/ModulePlaceholderPage';
import {
  Layers,
  UserCheck,
  GitBranch,
  Users,
  Settings,
  TrendingUp,
  Megaphone,
} from 'lucide-react';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },

      // Tenant modules
      {
        path: '/students',
        element: (
          <PermissionRoute permission="students.view">
            <StudentsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/courses',
        element: (
          <PermissionRoute permission="courses.view">
            <CoursesPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/batches',
        element: (
          <PermissionRoute permission="batches.view">
            <BatchesPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/teachers',
        element: (
          <PermissionRoute permission="teachers.view">
            <TeachersPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/attendance',
        element: (
          <PermissionRoute permission="attendance.view">
            <AttendancePage />
          </PermissionRoute>
        ),
      },
      {
        path: '/fees',
        element: (
          <PermissionRoute permission="fees.view">
            <FeesPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/exams',
        element: (
          <PermissionRoute permission="exams.view">
            <ExamsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/reports',
        element: (
          <PermissionRoute permission="reports.view">
            <ReportsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/branches',
        element: (
          <PermissionRoute permission="branches.view">
            <BranchesPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/users',
        element: (
          <PermissionRoute permission="users.view">
            <UsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <PermissionRoute permission="settings.manage">
            <SettingsPage />
          </PermissionRoute>
        ),
      },

      // Super Admin Modules
      {
        path: '/super-admin/tenants',
        element: (
          <PermissionRoute permission="tenants.view">
            <TenantsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/plans',
        element: (
          <PermissionRoute permission="plans.view">
            <PlansPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/subscriptions',
        element: (
          <PermissionRoute permission="subscriptions.view">
            <SubscriptionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/support',
        element: (
          <PermissionRoute permission="support.view">
            <SupportPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/audit-logs',
        element: (
          <PermissionRoute permission="audit.view">
            <AuditLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/reports/revenue',
        element: (
          <PermissionRoute permission="reports.view">
            <ModulePlaceholderPage
              title="Platform Revenue Report"
              description="SaaS subscription revenue, recurring billing analytics, and institute churn statistics."
              icon={TrendingUp}
              badge="Super Admin"
            />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/platform-settings',
        element: (
          <PermissionRoute permission="settings.manage">
            <ModulePlaceholderPage
              title="Platform Settings"
              description="Global SaaS configuration, payment gateway keys, SMTP email credentials, and SMS providers."
              icon={Settings}
              badge="Super Admin"
            />
          </PermissionRoute>
        ),
      },
      {
        path: '/super-admin/broadcast',
        element: (
          <PermissionRoute permission="broadcast.send">
            <ModulePlaceholderPage
              title="Broadcast Notification"
              description="Send system-wide broadcast announcements and maintenance alerts to all active institute tenants."
              icon={Megaphone}
              badge="Super Admin"
            />
          </PermissionRoute>
        ),
      },

      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
