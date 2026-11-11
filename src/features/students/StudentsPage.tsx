import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { studentsApi } from '@/api/students.api';
import { batchesApi } from '@/api/batches.api';
import { useDebounce } from '@/hooks/useDebounce';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import StudentFilters, { StudentFiltersValue } from './StudentFilters';
import StudentFormDialog from './StudentFormDialog';
import type { Student } from '@/types';

const StudentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<StudentFiltersValue>({ search: '', status: '', batchId: '' });
  const debouncedSearch = useDebounce(filters.search, 300);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const params = useMemo(
    () => ({ page, search: debouncedSearch, status: filters.status, batchId: filters.batchId }),
    [page, debouncedSearch, filters.status, filters.batchId]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.list(params),
  });

  const { data: batchesData } = useQuery({
    queryKey: ['batches', 'options'],
    queryFn: () => batchesApi.list({ perPage: 100 }),
  });

  const batches = batchesData?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student removed');
      setDeleting(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  const students: Student[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage admissions, details and batch assignments."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Admit student
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <StudentFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} batches={batches} />

          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : students.length === 0 ? (
            <EmptyState
              title="No students found"
              description="Try changing filters or admit your first student."
              actionLabel="Admit student"
              onAction={() => { setEditing(null); setFormOpen(true); }}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.firstName} {s.lastName}
                        {s.email && <div className="text-xs text-slate-400">{s.email}</div>}
                      </TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell className="text-slate-500">
                        {batches.find((b) => b.id === s.batchId)?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.status === 'active' ? 'success' : s.status === 'alumni' ? 'info' : 'secondary'
                          }
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setEditing(s); setFormOpen(true); }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleting(s)}
                          title="Delete"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages} · {pagination.total} students
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} student={editing} batches={batches} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Remove student?"
        description={`This will soft-delete ${deleting?.firstName ?? ''} ${deleting?.lastName ?? ''}. You can restore later.`}
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
};

export default StudentsPage;