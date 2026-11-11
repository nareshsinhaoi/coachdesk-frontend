import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import EmptyState from '@/components/common/EmptyState';

export interface PaymentRow {
  id: string | number;
  studentName: string;
  amount: number;
  method?: string;
  paidAt: string;
}

interface RecentPaymentsProps {
  payments: PaymentRow[];
  title?: string;
}

const RecentPayments: React.FC<RecentPaymentsProps> = ({ payments, title = 'Recent Payments' }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      {payments.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No payments yet" description="Recent fee payments will appear here." />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.studentName}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell>
                  <Badge variant="info">{p.method ?? 'Cash'}</Badge>
                </TableCell>
                <TableCell className="text-slate-500">{formatDate(p.paidAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);

export default RecentPayments;