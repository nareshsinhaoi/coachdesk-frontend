import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { KeyRound, User, Mail, Shield, Building, CheckCircle2 } from 'lucide-react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onOpenChange }) => {
  const user = useAuthStore((s) => s.user);

  const roleName = user?.tenant_id === null
    ? 'Super Admin'
    : user?.role || user?.roles?.[0] || 'Institute Admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <User className="h-5 w-5 text-indigo-600" />
            My Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-md">
              {initials(user?.name || 'User')}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                {user?.name || 'Administrator'}
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'admin@coachdesk.com'}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px] font-semibold uppercase">
                  {roleName}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4 text-slate-400" />
                Email
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {user?.email || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <Shield className="h-4 w-4 text-slate-400" />
                Assigned Role
              </span>
              <span className="font-medium capitalize text-slate-800 dark:text-slate-200">
                {roleName}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <Building className="h-4 w-4 text-slate-400" />
                Tenant ID
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user?.tenant_id ?? 'Platform Super Admin'}
              </span>
            </div>

            {user?.branch_id && (
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="text-slate-500">Branch ID</span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {user.branch_id}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onOpenChange }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate updating password
    setTimeout(() => {
      setLoading(false);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            Change Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <Input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

