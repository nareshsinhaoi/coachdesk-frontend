import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarCheck, RefreshCw, Save } from 'lucide-react';
import { attendanceApi } from '@/api/operations.api';
import { useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { AttendanceStatus } from '@/types';

const STATUSES: Array<{ value: AttendanceStatus; label: string; tone: string }> = [
  { value: 'present', label: 'Present', tone: 'bg-emerald-100 text-emerald-700' },
  { value: 'absent', label: 'Absent', tone: 'bg-rose-100 text-rose-700' },
  { value: 'late', label: 'Late', tone: 'bg-amber-100 text-amber-700' },
  { value: 'half_day', label: 'Half Day', tone: 'bg-sky-100 text-sky-700' },
  { value: 'on_leave', label: 'On Leave', tone: 'bg-slate-100 text-slate-600' },
];

const today = () => new Date().toISOString().slice(0, 10);

const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(today());
  const [rosterBatch, setRosterBatch] = useState<number | null>(null);
  const [rosterDate, setRosterDate] = useState(today());
  const [marks, setMarks] = useState<Record<string | number, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  const sessionsQuery = useQuery({
    queryKey: ['attendance-sessions', date],
    queryFn: () => attendanceApi.sessions(date),
  });

  const batchesQuery = useQuery({
    queryKey: ['batches-lite'],
    queryFn: async () => {
      // Reuse exams endpoint batch options (running batches)
      const { examsApi } = await import('@/api/operations.api');
      return examsApi.list();
    },
    staleTime: 5 * 60 * 1000,
  });

  const rosterQuery = useQuery({
    queryKey: ['attendance-roster', rosterBatch, rosterDate],
    queryFn: () => attendanceApi.roster(rosterBatch!, rosterDate),
    enabled: rosterBatch !== null,
  });

  useEffect(() => {
    if (rosterQuery.data) {
      setMarks({ ...rosterQuery.data.marked });
    }
  }, [rosterQuery.data]);

  const sessions = sessionsQuery.data?.sessions ?? [];

  const startMarking = (batchId: number) => {
    setRosterBatch(batchId);
    setRosterDate(date);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      attendanceApi.save({
        batch_id: rosterBatch!,
        attendance_date: rosterDate,
        status: marks,
      }),
    onSuccess: (res) => {
      toast.success(`Attendance saved for ${res.saved} students`);
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
      setRosterBatch(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Save failed');
    },
  });

  const markAll = useCallback((status: AttendanceStatus) => {
    if (!rosterQuery.data) return;
    const next: Record<string | number, AttendanceStatus> = {};
    rosterQuery.data.students.forEach((s) => { next[s.id] = status; });
    setMarks(next);
  }, [rosterQuery.data]);

  const markedCount = Object.keys(marks).length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Attendance"
        description="Mark daily attendance per batch and review session summaries."
        actions={
          <Button variant="outline" size="sm" onClick={() => sessionsQuery.refetch()}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${sessionsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Start new session
              </label>
              <select
                className="h-9 w-64 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value=""
                onChange={(e) => e.target.value && startMarking(Number(e.target.value))}
              >
                <option value="">Select a batch…</option>
                {(batchesQuery.data?.batches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.batch_name}</option>
                ))}
              </select>
            </div>
          </div>

          {sessionsQuery.isLoading ? (
            <div className="py-12 text-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No sessions on this date"
              description="Pick a batch above to start marking attendance."
              icon={<CalendarCheck className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="text-xs font-semibold">Batch</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Present</TableHead>
                    <TableHead className="text-xs font-semibold">Absent</TableHead>
                    <TableHead className="text-xs font-semibold">Late</TableHead>
                    <TableHead className="text-xs font-semibold">Marked</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.public_id}>
                      <TableCell className="font-medium">{s.batch_name}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'submitted' ? 'success' : 'secondary'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-emerald-600 font-semibold">{s.present_count}</TableCell>
                      <TableCell className="text-rose-600 font-semibold">{s.absent_count}</TableCell>
                      <TableCell className="text-amber-600 font-semibold">{s.late_count ?? 0}</TableCell>
                      <TableCell>{s.total_marked}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => startMarking(s.id)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roster drawer/dialog */}
      {rosterBatch !== null && (
        <Card className="border-indigo-200 dark:border-indigo-900 shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {rosterQuery.data?.batch.batch_name ?? 'Loading…'} — {rosterDate}
                </h3>
                <p className="text-xs text-slate-500">{markedCount} students marked</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((st) => (
                  <Button key={st.value} variant="outline" size="sm" onClick={() => markAll(st.value)}>
                    All {st.label}
                  </Button>
                ))}
                <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Saving…' : 'Save Attendance'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRosterBatch(null)}>Close</Button>
              </div>
            </div>

            {rosterQuery.isLoading ? (
              <div className="py-10 text-center"><LoadingSpinner size="lg" /></div>
            ) : (
              <div className="table-responsive max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                      <TableHead className="text-xs font-semibold">Student</TableHead>
                      <TableHead className="text-xs font-semibold">Code</TableHead>
                      <TableHead className="text-right text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(rosterQuery.data?.students ?? []).map((st) => (
                      <TableRow key={st.id}>
                        <TableCell className="font-medium">{st.name}</TableCell>
                        <TableCell className="text-slate-500">{st.student_code}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            {STATUSES.map((stt) => (
                              <button
                                key={stt.value}
                                type="button"
                                title={stt.label}
                                onClick={() => setMarks((m) => ({ ...m, [st.id]: stt.value }))}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                  marks[st.id] === stt.value
                                    ? stt.tone
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
                                }`}
                              >
                                {stt.label}
                              </button>
                            ))}
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
      )}
    </div>
  );
};

export default AttendancePage;
