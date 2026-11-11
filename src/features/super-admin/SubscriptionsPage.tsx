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

interface Subscription {
  id: number;
  tenantName: string;
  planName: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

const SubscriptionsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await apiClient.get('/super-admin/subscriptions');
      return res.data;
    },
  });
  const subs: Subscription[] = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Subscriptions" description="Active and past subscriptions." />
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : subs.length === 0 ? (
            <EmptyState title="No subscriptions" description="Subscriptions will appear here once tenants subscribe." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.tenantName}</TableCell>
                    <TableCell>{s.planName}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(s.startsAt)} → {formatDate(s.endsAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>
                    </TableCell>
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

export default SubscriptionsPage;