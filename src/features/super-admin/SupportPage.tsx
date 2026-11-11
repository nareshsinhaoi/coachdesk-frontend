import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface Ticket {
  id: number;
  subject: string;
  tenantName: string;
  status: string;
  createdAt: string;
}

const SupportPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await apiClient.get('/super-admin/support-tickets');
      return res.data;
    },
  });
  const tickets: Ticket[] = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Support tickets" description="All incoming support requests." />
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : tickets.length === 0 ? (
            <EmptyState title="No tickets" description="Nothing waiting for you." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.subject}</TableCell>
                    <TableCell>{t.tenantName}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'open' ? 'warning' : 'success'}>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;