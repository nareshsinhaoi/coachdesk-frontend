import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, RefreshCw } from 'lucide-react';
import { feesApi } from '@/api/operations.api';
import { useDebounce } from '@/hooks/useDebounce';
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
import type { FeeStudentSummary } from '@/types';

const money = (v: string | number) => Number(v || 0).toLocaleString();

const METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'online'];

const FeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [collectOpen, setCollectOpen] = useState(false);
  const [selected, setSelected] = useState<FeeStudentSummary | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['fees-summary', debounced],
    queryFn: () => feesApi.summary({ search: debounced || undefined, perPage: 100 }),
  });

  const students: FeeStudentSummary[] = useMemo(() => data?.students ?? [], [data]);
  const payments = data?.payments ?? [];

  const totals = useMemo(() => ({
    billed: students.reduce((a, s) => a + Number(s.total_fees || 0), 0),
    collected: students.reduce((a, s) => a + Number(s.paid_amount || 0), 0),
  }), [students]);
  const outstanding = Math.max(0, totals.billed - totals.collected);

  const collectMutation = useMutation({
    mutationFn: () =>
      feesApi.collect({
        student_id: selected!.id,
        amount: Number(amount),
        method,
        payment_date: paymentDate,
        notes: notes || undefined,
      }),
    onSuccess: (res) => {
      toast.success(`Payment recorded — receipt ${res.receipt_number}`);
      queryClient.invalidateQueries({ queryKey: ['fees-summary'] });
      setCollectOpen(false);
      setAmount(''); setNotes('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Payment failed');
    },
  });

  const openCollect = (s: FeeStudentSummary) => {
    setSelected(s);
    setAmount(String(Math.max(0, Number(s.due_amount))));
    setCollectOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Fees & Payments"
        description="Track student fee balances and record payments with automatic installment allocation."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Billed', value: `₹${money(totals.billed)}`, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Collected', value: `₹${money(totals.collected)}`, color: 'text-emerald-600' },
          { label: 'Outstanding', value: `₹${money(outstanding)}`, color: 'text-rose-600' },
        ].map((m) => (
          <Card key={m.label} className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
              <p className={`mt-1 text-2xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5 space-y-4">
          <Input
            placeholder="Search by student name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          {isLoading ? (
            <div className="py-16 text-center"><LoadingSpinner size="lg" /></div>
          ) : students.length === 0 ? (
            <EmptyState
              title="No students found"
              description="Students with fee accounts will appear here."
              icon={<Wallet className="h-8 w-8 text-slate-400" />}
            />
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="text-xs font-semibold">Student</TableHead>
                    <TableHead className="text-xs font-semibold">Code</TableHead>
                    <TableHead className="text-xs font-semibold">Total Fees</TableHead>
                    <TableHead className="text-xs font-semibold">Paid</TableHead>
                    <TableHead className="text-xs font-semibold">Due</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.public_id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-slate-500">{s.student_code}</TableCell>
                      <TableCell>₹{money(s.total_fees)}</TableCell>
                      <TableCell className="text-emerald-600">₹{money(s.paid_amount)}</TableCell>
                      <TableCell className={Number(s.due_amount) > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                        ₹{money(s.due_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openCollect(s)}>
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Collect
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

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Recent Payments</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 dark:bg-slate-900/60">
                    <TableHead className="text-xs font-semibold">Receipt</TableHead>
                    <TableHead className="text-xs font-semibold">Student</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Method</TableHead>
                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.public_id}>
                      <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                      <TableCell>{p.student_name}</TableCell>
                      <TableCell className="text-slate-500">{p.payment_date}</TableCell>
                      <TableCell className="capitalize">{p.method.replace('_', ' ')}</TableCell>
                      <TableCell className="font-semibold">₹{money(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'success' ? 'success' : 'secondary'}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collect dialog */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Collect Payment{selected ? ` — ${selected.name}` : ''}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => { e.preventDefault(); collectMutation.mutate(); }}
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Amount (₹)
              </label>
              <Input type="number" min="1" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Method
              </label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                {METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Payment Date
              </label>
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Notes (optional)
              </label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 2nd installment" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCollectOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={collectMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {collectMutation.isPending ? 'Recording…' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesPage;
