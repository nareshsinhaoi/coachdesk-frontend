import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  // Close the mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Mobile drawer (off-canvas) + Desktop fixed */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 transition-all duration-200 ease-in-out',
          // Mobile drawer: always 256px wide (w-64)
          mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full',
          // Desktop static: smoothly switch between w-64 and w-20
          'lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        <Sidebar
          onNavigate={() => setMobileOpen(false)}
          collapsed={sidebarCollapsed}
        />
      </aside>

      {/* Main column with responsive padding offset */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-200 ease-in-out',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
