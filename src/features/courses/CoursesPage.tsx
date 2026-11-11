import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { coursesApi } from '@/api/courses.api';
import { useDebounce } from '@/hooks/useDebounce';
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
import CourseFilters, { CourseFiltersValue } from './CourseFilters';
import CourseFormDialog from './CourseFormDialog';
import type { Course } from '@/types';

const CoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CourseFiltersValue>({ search: '', status: '' });
  const debouncedSearch = useDebounce(filters.search, 300);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['courses', { page }],
    queryFn: () => coursesApi.list({ perPage: 100, page }),
  });
  const courses: Course[] = data?.data ?? [];
  const pagination = data?.pagination;

  const filteredCourses = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return courses.filter((course) => {
      const name = course.course_name || course.name || '';
      const code = course.course_code || course.code || '';
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query);
      return matchesSearch && (!filters.status || course.status === filters.status);
    });
  }, [courses, debouncedSearch, filters.status]);

  const metrics = useMemo(
    () => ({
      total: courses.length,
      active: courses.filter((course) => course.status === 'active').length,
      inactive: courses.filter((course) => course.status === 'inactive').length,
    }),
    [courses],
  );

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => coursesApi.delete(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course removed successfully');
      setDeleting(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Delete failed');
    },
  });

  const openForm = (course: Course | null = null) => {
    setEditing(course);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Courses"
        description="Create and organize courses offered by your institute."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Courses', value: metrics.total, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Active', value: metrics.active, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Inactive', value: metrics.inactive, color: 'text-rose-600 dark:text-rose-400' },
        ].map((metric) => (
          <Card key={metric.label} className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {metric.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          <CourseFilters
            value={filters}
            onChange={(value) => {
              setFilters(value);
              setPage(1);
            }}
          />
          {isLoading ? (
            <div className="py-20 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-sm text-slate-500">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              title={courses.length === 0 ? 'No courses yet' : 'No courses match filters'}
              description={
                courses.length === 0
                  ? 'Add your first course to organize your institute’s programs.'
                  : 'Try changing your search or status filter.'
              }
              actionLabel="Add Course"
              onAction={() => openForm()}
              icon={<BookOpen className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                      <TableHead className="text-xs font-semibold">Course</TableHead>
                      <TableHead className="text-xs font-semibold">Code</TableHead>
                      <TableHead className="text-xs font-semibold">Duration</TableHead>
                      <TableHead className="text-xs font-semibold">Fees</TableHead>
                      <TableHead className="text-xs font-semibold">Description</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.public_id || course.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 shrink-0 text-indigo-500" />
                            <span>{course.course_name || course.name || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {course.course_code || course.code || '—'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {course.duration || '—'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {course.fees != null ? Number(course.fees).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="max-w-sm truncate text-slate-600 dark:text-slate-400">
                          {course.description || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={course.status === 'active' ? 'success' : 'danger'}
                            className="capitalize"
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-600 hover:text-indigo-600"
                              onClick={() => openForm(course)}
                              title="Edit course"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              onClick={() => setDeleting(course)}
                              title="Delete course"
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
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} courses
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((current) => current + 1)}
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

      <CourseFormDialog open={formOpen} onOpenChange={setFormOpen} course={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Course?"
        description={`Are you sure you want to delete "${deleting?.course_name || deleting?.name || 'this course'}"?`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.public_id || String(deleting.id));
        }}
      />
    </div>
  );
};

export default CoursesPage;
