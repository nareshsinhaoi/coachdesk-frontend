import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, Plus, RefreshCw } from 'lucide-react';
import { examsApi } from '@/api/operations.api';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
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
import type { Exam, ExamMarkEntry } from '@/types';

const ExamsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));

  const [marksFor, setMarksFor] = useState<Exam | null>(null);
  const [marks, setMarks] = useState<Record<string | number, ExamMarkEntry>>({});

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['exams'],
    queryFn: examsApi.list,
  });

  const marksQuery = useQuery({
    queryKey: ['exam-marks', marksFor?.public_id],
    queryFn: () => examsApi.marks(marksFor!.public_id),
    enabled: !!marksFor,
  });

  useEffect(() => {
    if (marksQuery.data) {
      const next: Record<string | number, ExamMarkEntry> = {};
      Object.entries(marksQuery.data.results).forEach(([k, v]) => { next[k] = { ...v }; });
      setMarks(next);
    }
  }, [marksQuery.data]);

  const createMutation = useMutation({
    mutationFn: () => examsApi.create({
      batch_id: Number(batchId),
      exam_name: examName,
      exam_date: examDate,
    }),
    onSuccess: () => {
      toast.success('Exam scheduled');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setCreateOpen(false);
      setExamName(''); setBatchId('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to schedule exam');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string | number, ExamMarkEntry> = {};
      Object.entries(marks).forEach(([sid, m]) => {
        if (m.marks_obtained !== '' && m.marks_obtained != null) payload[sid] = m;
      });
      return examsApi.saveMarks(marksFor!.public_id, payload);
    },
    onSuccess: (res) => {
      toast.success(`Marks saved for ${res.saved} students`);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam-marks'] });
      setMarksFor(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save marks');
    },
  });

  const exams = data?.exams ?? [];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Exams & Tests"
        description="Schedule exams, enter marks and track results per batch."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Exam
            </Button>
          </>
        }
      />

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          {isLoading ? (
            <div className="py-16 text-center"><LoadingSpinner size="lg" /></div>
          ) : exams.length === 0 ? (
            <EmptyState
              title="No exams scheduled"
              description="Schedule your first exam for a running batch."
              icon={<FileSpreadsheet className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="text-xs font-semibold">Exam</TableHead>
                    <TableHead className="text-xs font-semibold">Batch</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Results</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((e) => (
                    <TableRow key={e.public_id}>
                      <TableCell className="font-medium">{e.exam_name}</TableCell>
                      <TableCell className="text-slate-500">{e.batch_name}</TableCell>
                      <TableCell className="text-slate-500">{e.exam_date}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === 'scheduled' ? 'secondary' : 'success'}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{e.result_count}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setMarksFor(e)}>
                          Enter Marks
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

      {/* Create exam dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Schedule Exam</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Batch
              </label>
              <select value={batchId} onChange={(e) => setBatchId(e.target.value)} required
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                <option value="">Select batch…</option>
                {(data?.batches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.batch_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Exam Name
              </label>
              <Input value={examName} onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Unit Test 1" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Date
              </label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {createMutation.isPending ? 'Scheduling…' : 'Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Marks dialog */}
      <Dialog open={!!marksFor} onOpenChange={(open) => !open && setMarksFor(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Enter Marks — {marksFor?.exam_name} ({marksFor?.batch_name})
            </DialogTitle>
          </DialogHeader>
          {marksQuery.isLoading ? (
            <div className="py-10 text-center"><LoadingSpinner size="lg" /></div>
          ) : (marksQuery.data?.students ?? []).length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No active students in this batch.</p>
          ) : (
            <form
              className="space-y-3 pt-2"
              onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
            >
              {(marksQuery.data?.students ?? []).map((s) => {
                const entry = marks[s.id] || { marks_obtained: '', total_marks: 100 };
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.student_code}</p>
                    </div>
                    <Input
                      type="number" min="0" step="0.5" placeholder="Marks"
                      className="w-28" value={String(entry.marks_obtained)}
                      onChange={(e) =>
                        setMarks((m) => ({ ...m, [s.id]: { ...entry, marks_obtained: e.target.value } }))
                      }
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <Input
                      type="number" min="1" placeholder="Total"
                      className="w-24" value={String(entry.total_marks)}
                      onChange={(e) =>
                        setMarks((m) => ({ ...m, [s.id]: { ...entry, total_marks: e.target.value } }))
                      }
                    />
                  </div>
                );
              })}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setMarksFor(null)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {saveMutation.isPending ? 'Saving…' : 'Save Marks'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamsPage;
