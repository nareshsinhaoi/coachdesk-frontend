import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Pencil, Plus, RefreshCw, KeyRound } from 'lucide-react';
import { usersApi } from '@/api/admin.api';
import { useDebounce } from '@/hooks/useDebounce';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { StaffUser } from '@/types';

interface UserFormState {
  name: string;
  email: string;
  phone: string;
  role_id: string;
  branch_id: string;
}

const emptyForm: UserFormState = { name: '', email: '', phone: '', role_id: '', branch_id: '' };

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['users', { debounced, status, page }],
    queryFn: () => usersApi.list({
      search: debounced || undefined,
      status: status || undefined,
      page,
      perPage: 20,
    }),
  });

  const users: StaffUser[] = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.pagination;

  const options = useQuery({
    queryKey: ['user-form-options'],
    queryFn: usersApi.formOptions,
    staleTime: 5 * 60 * 1000,
  });

  const openForm = (u: StaffUser | null = null) => {
    setEditing(u);
    setForm(u ? {
      name: u.name, email: u.email, phone: u.phone || '',
      role_id: '', branch_id: u.branch_id ? String(u.branch_id) : '',
    } : emptyForm);
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
      };
      if (form.role_id) payload.role_id = Number(form.role_id);
      return editing
        ? usersApi.update(editing.public_id, payload)
        : usersApi.create(payload as any);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormOpen(false);
      if (res?.temp_password) {
        setTempPassword(res.temp_password);
        toast.success('User created — save the temporary password');
      } else {
        toast.success('User updated');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Save failed');
    },
  });

  const resetMutation = useMutation({
    mutationFn: (publicId: string) => usersApi.resetPassword(publicId),
    onSuccess: (res) => {
      setTempPassword(res.temp_password);
      toast.success('Password reset — all sessions logged out');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Reset failed');
    },
  });

  const set = (k: keyof UserFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="User Management"
        description="Institute staff accounts, role assignments and access status."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </>
        }
      />

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-sm"
            />
            <select
              className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>

          {isLoading ? (
            <div className="py-16 text-center"><LoadingSpinner size="lg" /></div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Invite your staff by creating their accounts."
              actionLabel="Add User"
              onAction={() => openForm()}
              icon={<Users className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                      <TableHead className="text-xs font-semibold">User</TableHead>
                      <TableHead className="text-xs font-semibold">Role</TableHead>
                      <TableHead className="text-xs font-semibold">Branch</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Last Login</TableHead>
                      <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.public_id}>
                        <TableCell>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {u.roles || '—'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {u.branch_name || 'All branches'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.status === 'active' ? 'success' : u.status === 'locked' ? 'danger' : 'secondary'}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {u.last_login_at ? u.last_login_at.slice(0, 16).replace('T', ' ') : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8"
                              onClick={() => openForm(u)} title="Edit user">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-amber-600"
                              onClick={() => resetMutation.mutate(u.public_id)} title="Reset password">
                              <KeyRound className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} users</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editing ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Full Name *</label>
              <Input value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Email *</label>
              <Input type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Phone</label>
              <Input value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Role {editing ? '(leave blank to keep)' : '*'}
              </label>
              <select value={form.role_id} onChange={set('role_id')} required={!editing}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                <option value="">{editing ? 'Keep current role' : 'Select role…'}</option>
                {(options.data?.roles ?? []).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Branch</label>
              <select value={form.branch_id} onChange={set('branch_id')}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                <option value="">All branches</option>
                {(options.data?.branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saveMutation.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Temp password dialog */}
      <Dialog open={!!tempPassword} onOpenChange={(open) => !open && setTempPassword(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <KeyRound className="h-5 w-5 text-amber-600" />
              Temporary Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Share this one-time password with the user. It will not be shown again.
            </p>
            <div className="rounded-lg bg-slate-100 p-3 text-center font-mono text-lg font-bold tracking-wider dark:bg-slate-800">
              {tempPassword}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setTempPassword(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
