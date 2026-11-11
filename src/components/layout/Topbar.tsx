import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  User as UserIcon,
  KeyRound,
  Search,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { initials } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ChangePasswordDialog } from './ProfileModals';

interface TopbarProps {
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          {/* Mobile hamburger — visible on <lg */}
          <button
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop collapse toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Search bar matching PHP reference */}
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search students, batches, fees…"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50/70 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Action: Collect Fee */}
          <Link
            to="/fees"
            className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            <span>Collect Fee</span>
          </Link>

          {/* User Menu Dropdown (My Profile, Change Password, Logout) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">
                {initials(user?.name || 'U')}
              </div>
              <div className="hidden text-left md:block">
                <p className="max-w-[130px] truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user?.name || 'Administrator'}
                </p>
                <p className="max-w-[130px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email || 'admin@coachdesk.com'}
                </p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
            </button>

            {/* Dropdown Menu Popup */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl transition-all z-50 dark:border-slate-800 dark:bg-slate-900">
                {/* User Info Header */}
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || 'admin@coachdesk.com'}
                  </div>
                </div>

                {/* My Profile */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                {/* Change Password */}
                {/* <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  <span>Change Password</span>
                </button> */}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals triggered from Topbar */}
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
};

export default Topbar;
