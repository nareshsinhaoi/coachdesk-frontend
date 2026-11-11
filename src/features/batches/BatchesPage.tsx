import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Layers,
  Clock,
  Calendar,
  Users,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { batchesApi } from '@/api/batches.api';
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
import BatchFilters, { BatchFiltersValue } from './BatchFilters';
import BatchFormDialog from './BatchFormDialog';
import type { Batch } from '@/types';

// Helper to format time (e.g., "18:00:00" -> "6:00 PM")
function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '—';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

const BatchesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<BatchFiltersValue>({
    search: '',
    status: '',
    course: '',
  });
  const debouncedSearch = useDebounce(filters.search, 300);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [deleting, setDeleting] = useState<Batch | null>(null);

  // Fetch batches with perPage=100
  const { data: responseData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['batches', { page }],
    queryFn: () => batchesApi.list({ perPage: 100, page }),
  });

  const allBatches: Batch[] = responseData?.data ?? [];
  const pagination = responseData?.pagination;

  // Extract distinct course names for filter dropdown
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    allBatches.forEach((b) => {
      if (b.course_name) set.add(b.course_name);
    });
    return Array.from(set);
  }, [allBatches]);

  // Client-side filtering
  const filteredBatches = useMemo(() => {
    return allBatches.filter((b) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (b.batch_name || b.name || '').toLowerCase().includes(q) ||
        (b.batch_code || b.code || '').toLowerCase().includes(q) ||
        (b.course_name || '').toLowerCase().includes(q) ||
        (b.course_code || '').toLowerCase().includes(q);

      const matchStatus = !filters.status || b.status === filters.status;
      const matchCourse = !filters.course || b.course_name === filters.course;

      return matchSearch && matchStatus && matchCourse;
    });
  }, [allBatches, debouncedSearch, filters.status, filters.course]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = allBatches.length;
    const running = allBatches.filter((b) => b.status === 'running').length;
    const upcoming = allBatches.filter((b) => b.status === 'upcoming').length;
    const totalCapacity = allBatches.reduce(
      (acc, b) => acc + (Number(b.capacity) || 0),
      0
    );
    return { total, running, upcoming, totalCapacity };
  }, [allBatches]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => batchesApi.delete(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch removed successfully');
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
        title="Batches"
        description="Organize courses into scheduled batches, student capacity, and class timings."
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
              <span>New Batch</span>
            </Button>
          </div>
        }
      />

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Batches
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.total}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Running
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.running}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Upcoming
            </p>
            <p className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
              {metrics.upcoming}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Total Seats
            </p>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.totalCapacity}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          {/* Filters */}
          <BatchFilters
            value={filters}
            onChange={(v) => {
              setFilters(v);
              setPage(1);
            }}
            courses={uniqueCourses}
          />

          {isLoading ? (
            <div className="py-20 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-sm text-slate-500 animate-pulse">
                Loading batches data...
              </p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <EmptyState
              title={allBatches.length === 0 ? 'No batches yet' : 'No batches match filters'}
              description={
                allBatches.length === 0
                  ? 'Get started by creating your first course batch with timing and student capacity.'
                  : 'Try clearing the search query or status filter to see other batches.'
              }
              actionLabel="Create Batch"
              onAction={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              icon={<Layers className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                      <TableHead className="font-semibold text-xs">Batch</TableHead>
                      <TableHead className="font-semibold text-xs">Course</TableHead>
                      <TableHead className="font-semibold text-xs">Timing</TableHead>
                      <TableHead className="font-semibold text-xs">Start Date</TableHead>
                      <TableHead className="font-semibold text-xs text-center">
                        Capacity
                      </TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((b) => (
                      <TableRow
                        key={b.public_id || b.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                      >
                        {/* Batch Name & Code */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                              <Layers className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {b.batch_name || b.name}
                              </div>
                              <span className="inline-block font-mono text-[11px] font-medium text-slate-500">
                                {b.batch_code || b.code}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Course Name */}
                        <TableCell>
                          {b.course_name ? (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {b.course_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                          {b.course_code && (
                            <span className="text-[11px] font-mono text-slate-400 block">
                              {b.course_code}
                            </span>
                          )}
                        </TableCell>

                        {/* Timing */}
                        <TableCell>
                          {b.timing_start ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>
                                {formatTime(b.timing_start)}
                                {b.timing_end && ` - ${formatTime(b.timing_end)}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Start Date */}
                        <TableCell>
                          {b.start_date ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{formatDate(b.start_date)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Capacity */}
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Users className="h-3 w-3 text-slate-400" />
                            {b.capacity}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={
                              b.status === 'running'
                                ? 'success'
                                : b.status === 'upcoming'
                                ? 'info'
                                : b.status === 'cancelled'
                                ? 'danger'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {b.status}
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
                                setEditing(b);
                                setFormOpen(true);
                              }}
                              title="Edit batch"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => setDeleting(b)}
                              title="Delete batch"
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

              {/* Pagination info if pagination object has multiple pages */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} batches
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
      <BatchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        batch={editing}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete Batch?"
        description={`Are you sure you want to delete "${
          deleting?.batch_name || deleting?.name || 'this batch'
        }"? Any active student assignments will be affected.`}
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

export default BatchesPage;

