import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  CreditCard,
  Headphones,
  TrendingUp,
  ScrollText,
  Settings,
  Megaphone,
  GraduationCap,
  BookOpen,
  Layers,
  UserCheck,
  CalendarCheck,
  Wallet,
  FileSpreadsheet,
  BarChart3,
  GitBranch,
  Users,
  KeyRound,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, isSuperAdmin } from '@/stores/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { User as UserIcon } from 'lucide-react';
import { ChangePasswordDialog } from './ProfileModals';
import { Logo } from '@/assets/logo';

interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

// Super Admin Menu (Platform Level)
const superAdminMenu: NavItem[] = [
  { to: '/dashboard', label: 'Platform Dashboard', icon: LayoutDashboard },
  { to: '/super-admin/tenants', label: 'Institutes', icon: Building2, permission: 'tenants.view' },
  { to: '/super-admin/plans', label: 'Subscription Plans', icon: Package, permission: 'plans.view' },
  { to: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard, permission: 'subscriptions.view' },
  { to: '/super-admin/support', label: 'Support Tickets', icon: Headphones, permission: 'support.view' },
  { to: '/super-admin/reports/revenue', label: 'Revenue Report', icon: TrendingUp, permission: 'reports.view' },
  { to: '/super-admin/audit-logs', label: 'Audit Logs', icon: ScrollText, permission: 'audit.view' },
  { to: '/super-admin/platform-settings', label: 'Platform Settings', icon: Settings, permission: 'settings.manage' },
  { to: '/super-admin/broadcast', label: 'Broadcast', icon: Megaphone, permission: 'broadcast.send' },
];

// Tenant Primary Menu (Daily Operations)
const tenantPrimaryMenu: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: GraduationCap, permission: 'students.view' },
  { to: '/courses', label: 'Courses', icon: BookOpen, permission: 'courses.view' },
  { to: '/batches', label: 'Batches', icon: Layers, permission: 'batches.view' },
  { to: '/teachers', label: 'Teachers', icon: UserCheck, permission: 'teachers.view' },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, permission: 'attendance.view' },
  { to: '/fees', label: 'Fees', icon: Wallet, permission: 'fees.view' },
  { to: '/exams', label: 'Exams', icon: FileSpreadsheet, permission: 'exams.view' },
  { to: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.view' },
];

// Tenant Secondary Menu (Administration)
const tenantSecondaryMenu: NavItem[] = [
  { to: '/profile', label: 'My Profile', icon: UserIcon },
  { to: '/branches', label: 'Branches', icon: GitBranch, permission: 'branches.view' },
  { to: '/users', label: 'Users', icon: Users, permission: 'users.view' },
  { to: '/settings', label: 'Settings', icon: Settings, permission: 'settings.manage' },
];

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, collapsed = false }) => {
  const user = useAuthStore((s) => s.user);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const { logout } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);

  const isSuper = isSuperAdmin(user);

  const renderNavLinks = (items: NavItem[]) =>
    items
      .filter((i) => !i.permission || hasPermission(i.permission))
      .map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              'sidebar-link group flex items-center rounded-lg text-sm transition-all duration-150',
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
              isActive
                ? 'bg-indigo-600/30 text-white font-semibold shadow-inner'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform group-hover:scale-105',
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      ));

  return (
    <>
      <div className="flex h-full flex-col bg-slate-900 text-white select-none">
        {/* Top Header: Brand + User info (matching sidebar.php) */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-2 text-lg font-bold tracking-tight bg-white w-full rounded-lg px-2 py-1 text-slate-200 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm">
                🎓
              </span>
              {!collapsed && (
                <span>
                  Coach<span className="text-indigo-400">Desk</span>
                </span>
              )}  
            </div> */}

<div className="flex items-center  text-lg font-bold tracking-tight bg-slate-200 w-full rounded-lg   text-slate-200 shadow-sm">
  <div className="flex h-12 w-12 shrink-0 items-center justify-center text-4xl">
    🎓
  </div> 
  {!collapsed && (
    <div className="flex flex-col leading-tight">
      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Coach<span className="text-indigo-600 dark:text-indigo-400">Desk</span>
      </span> 
    </div>
  )}
</div>

            {/* Mobile close button */}
            {onNavigate && (
              <button
                onClick={onNavigate}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {!collapsed && (
            <div className="mt-3 text-xs text-slate-400">
              <p className="truncate font-medium text-slate-200">
                {user?.name || 'Administrator'}
              </p>
              <p className="truncate text-slate-500">
                {user?.email || 'admin@coachdesk.com'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {isSuper ? (
            // Super Admin Navigation
            <>
              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Super Admin
                </div>
              )}
              {renderNavLinks(superAdminMenu)}
            </>
          ) : (
            // Tenant Navigation
            <>
              {renderNavLinks(tenantPrimaryMenu)}

              {/* Divider between primary ops and administration */}
              <div className="my-3 border-t border-white/10" />

              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Management
                </div>
              )}
              {renderNavLinks(tenantSecondaryMenu)}
            </>
          )}
        </nav>

        {/* Footer: Change Password & Logout (matching sidebar.php) */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {/* <button
            onClick={() => {
              if (onNavigate) onNavigate();
              setPasswordOpen(true);
            }}
            title={collapsed ? 'Change Password' : undefined}
            className={cn(
              'sidebar-link flex w-full items-center rounded-lg text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            )}
          >
            <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Change Password</span>}
          </button> */}

          <button
            onClick={() => {
              if (onNavigate) onNavigate();
              logout();
            }}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'sidebar-link flex w-full items-center rounded-lg text-sm text-rose-400 transition-colors hover:bg-rose-950/40 hover:text-rose-300',
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-400" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
};

export default Sidebar;
