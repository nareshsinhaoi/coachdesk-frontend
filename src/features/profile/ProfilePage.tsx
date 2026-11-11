import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KeyRound, User, Mail, Shield, Building, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { profileApi } from '@/api/operations.api';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { initials } from '@/lib/utils';
import { toast } from 'sonner';
import ChangePasswordDialog from './ChangePasswordDialog';

const ProfilePage: React.FC = () => {
  const storeUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwOpen, setPwOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.me,
  });

  useEffect(() => {
    if (data) {
      setName(data.name || '');
      setEmail(data.email || '');
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => profileApi.update({ name, email }),
    onSuccess: (updated) => {
      toast.success('Profile updated');
      // keep the auth store in sync
      if (setUser && storeUser) {
        setUser({ ...storeUser, name: updated.name, email: updated.email });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Update failed');
    },
  });

  const profile = data ?? storeUser;
  const roleName =
    (profile as any)?.tenant_id == null
      ? 'Super Admin'
      : (profile as any)?.role || (profile as any)?.roles?.[0] || 'Institute Admin';

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-slate-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Profile"
        description="Manage your account details and password."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPwOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-md">
              {initials(profile?.name || 'User')}
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              {profile?.name || 'Administrator'}
            </h3>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-[11px] font-semibold uppercase">{roleName}</Badge>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Editable details */}
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">Account Details</h3>
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
            >
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
                </label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <Shield className="h-3.5 w-3.5 text-slate-400" /> Role
                  </label>
                  <Input value={roleName} disabled className="capitalize bg-slate-50 dark:bg-slate-800/60" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <Building className="h-3.5 w-3.5 text-slate-400" /> Tenant
                  </label>
                  <Input
                    value={(profile as any)?.tenant_id ?? 'Platform Super Admin'}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800/60"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
};

export default ProfilePage;
