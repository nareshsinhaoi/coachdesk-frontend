import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { teachersApi } from '@/api/teachers.api';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import TeacherFilters, { TeacherFiltersValue } from './TeacherFilters';
import TeacherFormDialog from './TeacherFormDialog';
import type { Teacher } from '@/types';

// Generate a consistent avatar color from name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const TeachersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TeacherFiltersValue>({
    search: '',
    status: '',
    subject: '',
  });
  const debouncedSearch = useDebounce(filters.search, 300);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  // Fetch teachers with perPage=100
  const { data: responseData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['teachers', { page }],
    queryFn: () => teachersApi.list({ perPage: 100, page }),
  });

  const allTeachers: Teacher[] = responseData?.data ?? [];
  const pagination = responseData?.pagination;

  // Extract distinct subjects for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    allTeachers.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set);
  }, [allTeachers]);

  // Client-side filtering
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter((t) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.qualification || '').toLowerCase().includes(q);

      const matchStatus = !filters.status || t.status === filters.status;
      const matchSubject = !filters.subject || t.subject === filters.subject;

      return matchSearch && matchStatus && matchSubject;
    });
  }, [allTeachers, debouncedSearch, filters.status, filters.subject]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = allTeachers.length;
    const active = allTeachers.filter((t) => t.status === 'active').length;
    const inactive = allTeachers.filter((t) => t.status === 'inactive').length;
    const subjects = new Set(allTeachers.map((t) => t.subject).filter(Boolean)).size;
    return { total, active, inactive, subjects };
  }, [allTeachers]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => teachersApi.delete(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher removed successfully');
      setDeleting(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Delete failed');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Teachers"
        description="Manage faculty profiles, subject allocations, and instructor schedules."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Teacher</span>
            </Button>
          </div>
        }
      />

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Teachers
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.total}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.active}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">
              Inactive
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-500 dark:text-rose-400">
              {metrics.inactive}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Subjects
            </p>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.subjects}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          {/* Filters */}
          <TeacherFilters
            value={filters}
            onChange={(v) => {
              setFilters(v);
              setPage(1);
            }}
            subjects={uniqueSubjects}
          />

          {isLoading ? (
            <div className="py-20 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-sm text-slate-500 animate-pulse">
                Loading teachers data...
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <EmptyState
              title={allTeachers.length === 0 ? 'No teachers yet' : 'No teachers match filters'}
              description={
                allTeachers.length === 0
                  ? 'Get started by adding your first teacher profile with subject and schedule details.'
                  : 'Try clearing the search query or status filter to see other teachers.'
              }
              actionLabel="Add Teacher"
              onAction={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              icon={<UserCheck className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                      <TableHead className="font-semibold text-xs">Teacher</TableHead>
                      <TableHead className="font-semibold text-xs">Contact</TableHead>
                      <TableHead className="font-semibold text-xs">Subject</TableHead>
                      <TableHead className="font-semibold text-xs">Qualification</TableHead>
                      <TableHead className="font-semibold text-xs text-center">Exp.</TableHead>
                      <TableHead className="font-semibold text-xs">Joining Date</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((t) => (
                      <TableRow
                        key={t.public_id || t.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                      >
                        {/* Teacher Name & Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColor(t.name)}`}
                            >
                              {getInitials(t.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {t.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="space-y-1">
                            {t.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[160px]">{t.email}</span>
                              </div>
                            )}
                            {t.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{t.phone}</span>
                              </div>
                            )}
                            {!t.email && !t.phone && (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Subject */}
                        <TableCell>
                          {t.subject ? (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {t.subject}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>

                        {/* Qualification */}
                        <TableCell>
                          {t.qualification ? (
                            <div className="flex items-center gap-1.5">
                              <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {t.qualification}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Experience */}
                        <TableCell className="text-center">
                          {t.experience_years != null ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {t.experience_years}y
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Joining Date */}
                        <TableCell>
                          {t.joining_date ? (
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {formatDate(t.joining_date)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={t.status === 'active' ? 'success' : 'danger'}
                            className="capitalize"
                          >
                            {t.status}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-600 hover:text-indigo-600"
                              onClick={() => {
                                setEditing(t);
                                setFormOpen(true);
                              }}
                              title="Edit teacher"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => setDeleting(t)}
                              title="Delete teacher"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination info */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} teachers
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
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

      {/* Create / Edit Form Dialog */}
      <TeacherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        teacher={editing}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete Teacher?"
        description={`Are you sure you want to delete "${
          deleting?.name || 'this teacher'
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.public_id || String(deleting.id));
          }
        }}
      />
    </div>
  );
};

export default TeachersPage;

