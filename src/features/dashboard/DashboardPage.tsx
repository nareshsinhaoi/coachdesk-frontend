import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';
import { formatCurrency, formatDate, initials } from '@/lib/utils';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Layers,
  Wallet,
  AlertCircle,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  CreditCard,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCards, { StatCard } from './StatCards';
import CollectionChart from './CollectionChart';
import AdmissionsChart from './AdmissionsChart';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await dashboardApi.getStats()).data,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Loading institute dashboard...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          Failed to load dashboard data
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          We encountered an issue communicating with the server. Please check your connection or try again.
        </p>
        <div className="mt-6">
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const s = data;

  // KPI cards
  const statCards: StatCard[] = [
    {
      label: 'Total Students',
      value: s.students?.total ?? 0,
      icon: Users,
      accent: 'indigo',
      subtext: s.students?.active !== undefined ? `${s.students.active} active students` : undefined,
      trend: s.students?.new_this_month
        ? { value: s.students.new_this_month, positive: true }
        : undefined,
    },
    {
      label: 'Active Batches',
      value: s.batches?.running ?? 0,
      icon: Layers,
      accent: 'sky',
      subtext: s.batches?.total !== undefined ? `${s.batches.total} total batches` : undefined,
    },
    {
      label: 'Collected (Month)',
      value: formatCurrency(s.fees?.collected_month ?? 0),
      icon: Wallet,
      accent: 'emerald',
      subtext: s.fees?.collected_today
        ? `Today: ${formatCurrency(s.fees.collected_today)}`
        : undefined,
    },
    {
      label: 'Outstanding Fees',
      value: formatCurrency(s.fees?.outstanding ?? 0),
      icon: AlertCircle,
      accent: 'red',
      subtext: s.fees?.defaulters_count
        ? `${s.fees.defaulters_count} pending defaulters`
        : undefined,
    },
  ];

  // Attendance metrics if available
  const att = s.attendance_today;
  const totalMarked = att?.total_marked ?? 0;
  const presentCount = att?.present ?? 0;
  const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Quick Actions */}
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here is the operational and financial overview of your institute today."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Link to="/students">
              <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Users className="h-3.5 w-3.5" />
                <span>View Students</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <StatCards stats={statCards} />

      {/* Today's Attendance Snapshot (If available) */}
      {att && totalMarked > 0 && (
        <Card className="border-slate-200/80 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    Today's Attendance Pulse
                  </span>
                </div>
                <h4 className="mt-1 text-xl font-bold">
                  {attendanceRate}% Present ({presentCount} of {totalMarked} students marked)
                </h4>
              </div>

              {/* Progress and status chips */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{presentCount} Present</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300">
                  <XCircle className="h-4 w-4" />
                  <span>{att.absent ?? 0} Absent</span>
                </div>

                {(att.late ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300">
                    <Clock className="h-4 w-4" />
                    <span>{att.late} Late</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CollectionChart
          data={(s.monthly_collection || []).map((c: any) => ({
            month: c.month,
            amount: Number(c.total) || 0,
          }))}
        />
        <AdmissionsChart data={s.admissions_chart || []} />
      </div>

      {/* Lists / Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payments Table */}
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Recent Fee Payments
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest transactions processed in the institute
              </p>
            </div>
            <Link
              to="/fees"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="font-semibold text-xs">Receipt</TableHead>
                    <TableHead className="font-semibold text-xs">Student</TableHead>
                    <TableHead className="font-semibold text-xs">Mode</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Amount</TableHead>
                    <TableHead className="font-semibold text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(s.recent_payments || []).map((p: any) => (
                    <TableRow
                      key={p.public_id || p.receipt_number}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                    >
                      <TableCell className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                        {p.receipt_number || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                            {initials(p.student_name || 'S')}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {p.student_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-[11px] uppercase tracking-wide font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {p.method || 'CASH'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(p.payment_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(s.recent_payments || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                        <CreditCard className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-sm">No recent payment transactions recorded.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exams Table */}
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Upcoming Exams
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled tests and assessments across batches
              </p>
            </div>
            <Link
              to="/exams"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="font-semibold text-xs">Exam Name</TableHead>
                    <TableHead className="font-semibold text-xs">Batch</TableHead>
                    <TableHead className="font-semibold text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(s.upcoming_exams || []).map((e: any) => (
                    <TableRow
                      key={e.public_id || e.exam_name}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-slate-400" />
                          <span>{e.exam_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-normal text-indigo-600 border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300"
                        >
                          {e.batch_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(e.exam_date)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(s.upcoming_exams || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-12 text-center text-slate-400">
                        <Calendar className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-sm">No upcoming exams scheduled.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
