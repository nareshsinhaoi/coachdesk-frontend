import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Pencil, Plus, RefreshCw, Trash2, MapPin } from 'lucide-react';
import { branchesApi } from '@/api/admin.api';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmDialog from '@/components/common/ConfirmDialog';
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
import type { Branch, BranchPayload } from '@/types';

const emptyForm: BranchPayload = {
  name: '', branch_code: '', address_line1: '', city: '', state: '', pincode: '', phone: '', email: '',
};

const BranchesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchPayload>(emptyForm);
  const [deleting, setDeleting] = useState<Branch | null>(null);

  const { data: branches, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['branches'],
    queryFn: branchesApi.list,
  });

  const openForm = (b: Branch | null = null) => {
    setEditing(b);
    setForm(b ? {
      name: b.name,
      branch_code: b.branch_code,
      address_line1: b.address_line1 || '',
      city: b.city || '',
      state: b.state || '',
      pincode: b.pincode || '',
      phone: b.phone || '',
      email: b.email || '',
      status: b.status,
    } : emptyForm);
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => editing
      ? branchesApi.update(editing.public_id, form)
      : branchesApi.create(form),
    onSuccess: () => {
      toast.success(editing ? 'Branch updated' : 'Branch created');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Save failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => branchesApi.remove(publicId),
    onSuccess: () => {
      toast.success('Branch removed');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setDeleting(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Delete failed');
    },
  });

  const set = (k: keyof BranchPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Branches"
        description="Manage campus locations, contact details and branch-level staff/student counts."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </>
        }
      />

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          {isLoading ? (
            <div className="py-16 text-center"><LoadingSpinner size="lg" /></div>
          ) : (branches ?? []).length === 0 ? (
            <EmptyState
              title="No branches yet"
              description="Add your first campus location."
              actionLabel="Add Branch"
              onAction={() => openForm()}
              icon={<GitBranch className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="text-xs font-semibold">Branch</TableHead>
                    <TableHead className="text-xs font-semibold">Code</TableHead>
                    <TableHead className="text-xs font-semibold">Location</TableHead>
                    <TableHead className="text-xs font-semibold">Contact</TableHead>
                    <TableHead className="text-xs font-semibold">Staff</TableHead>
                    <TableHead className="text-xs font-semibold">Students</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(branches ?? []).map((b) => (
                    <TableRow key={b.public_id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{b.branch_code}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {[b.city, b.state].filter(Boolean).join(', ') || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{b.phone || '—'}</TableCell>
                      <TableCell>{Number(b.staff_count || 0)}</TableCell>
                      <TableCell>{Number(b.student_count || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'active' ? 'success' : 'danger'}>{b.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8"
                            onClick={() => openForm(b)} title="Edit branch">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            onClick={() => setDeleting(b)} title="Delete branch">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editing ? 'Edit Branch' : 'Add Branch'}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Name *</label>
                <Input value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Code {editing ? '' : '*'}
                </label>
                <Input value={form.branch_code || ''} onChange={set('branch_code')}
                  disabled={!!editing} required={!editing} placeholder="e.g. GN-01" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Address</label>
              <Input value={form.address_line1 || ''} onChange={set('address_line1')} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">City</label>
                <Input value={form.city || ''} onChange={set('city')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">State</label>
                <Input value={form.state || ''} onChange={set('state')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Pincode</label>
                <Input value={form.pincode || ''} onChange={set('pincode')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Phone</label>
                <Input value={form.phone || ''} onChange={set('phone')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Email</label>
                <Input type="email" value={form.email || ''} onChange={set('email')} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saveMutation.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Branch'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Branch?"
        description={`Are you sure you want to delete "${deleting?.name}"? Branches with assigned staff or students cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.public_id);
        }}
      />
    </div>
  );
};

export default BranchesPage;
