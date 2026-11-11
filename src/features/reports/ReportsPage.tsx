import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, RefreshCw, IndianRupee, CalendarCheck, GraduationCap } from 'lucide-react';
import { reportsApi } from '@/api/operations.api';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const money = (v: string | number) => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

const ReportsPage: React.FC = () => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.overview,
  });

  const feeMonthly = data?.fee_monthly ?? [];
  const attendance = data?.attendance_by_batch ?? [];
  const examStats = data?.exam_stats ?? [];
  const maxFee = Math.max(1, ...feeMonthly.map((f) => Number(f.total || 0)));

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Analytics & Reports"
        description="Financial collection trends, attendance summary and exam performance."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="py-20 text-center"><LoadingSpinner size="lg" /></CardContent>
        </Card>
      ) : (feeMonthly.length === 0 && attendance.length === 0 && examStats.length === 0) ? (
        <EmptyState
          title="No data yet"
          description="Reports appear once you record payments, attendance and exam results."
          icon={<BarChart3 className="h-8 w-8 text-slate-400" />}
        />
      ) : (
        <>
          {/* Fee collection trend */}
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                Fee Collection — Last 12 Months
              </h3>
              {feeMonthly.length === 0 ? (
                <p className="text-sm text-slate-500">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {feeMonthly.map((f) => (
                    <div key={f.ym} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-xs font-medium text-slate-500">{f.ym}</span>
                      <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded bg-emerald-500/80"
                          style={{ width: `${(Number(f.total || 0) / maxFee) * 100}%` }}
                        />
                      </div>
                      <span className="w-28 shrink-0 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                        ₹{money(f.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance by batch */}
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <CalendarCheck className="h-4 w-4 text-indigo-600" />
                Attendance by Batch
              </h3>
              {attendance.length === 0 ? (
                <p className="text-sm text-slate-500">No attendance records yet.</p>
              ) : (
                <div className="table-responsive">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                        <TableHead className="text-xs font-semibold">Batch</TableHead>
                        <TableHead className="text-xs font-semibold">Present</TableHead>
                        <TableHead className="text-xs font-semibold">Absent</TableHead>
                        <TableHead className="text-xs font-semibold">Late</TableHead>
                        <TableHead className="text-xs font-semibold">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((a) => {
                        const total = Number(a.total || 0);
                        const present = Number(a.present || 0);
                        const rate = total ? Math.round((present / total) * 100) : 0;
                        return (
                          <TableRow key={a.batch_name}>
                            <TableCell className="font-medium">{a.batch_name}</TableCell>
                            <TableCell className="text-emerald-600">{a.present}</TableCell>
                            <TableCell className="text-rose-600">{a.absent}</TableCell>
                            <TableCell className="text-amber-600">{a.late ?? 0}</TableCell>
                            <TableCell>
                              <span className={`font-semibold ${rate >= 75 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {rate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam performance */}
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <GraduationCap className="h-4 w-4 text-violet-600" />
                Exam Performance by Batch
              </h3>
              {examStats.length === 0 ? (
                <p className="text-sm text-slate-500">No exam results recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                        <TableHead className="text-xs font-semibold">Batch</TableHead>
                        <TableHead className="text-xs font-semibold">Students Graded</TableHead>
                        <TableHead className="text-xs font-semibold">Average Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examStats.map((e) => (
                        <TableRow key={e.batch_name}>
                          <TableCell className="font-medium">{e.batch_name}</TableCell>
                          <TableCell>{e.students_graded}</TableCell>
                          <TableCell className="font-semibold text-indigo-600">
                            {e.avg_percentage != null ? `${e.avg_percentage}%` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
