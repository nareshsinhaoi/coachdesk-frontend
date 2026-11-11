import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileApi } from '@/api/operations.api';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onOpenChange }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      await profileApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
