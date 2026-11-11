import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface Plan {
  id: number;
  name: string;
  priceMonthly: number;
  studentLimit: number;
  status: string;
}

const PlansPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await apiClient.get('/super-admin/plans');
      return res.data;
    },
  });
  const plans: Plan[] = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Plans" description="Subscription plans offered to institutes." />
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : plans.length === 0 ? (
            <EmptyState title="No plans configured" description="Create your first plan." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Monthly price</TableHead>
                  <TableHead>Student limit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{formatCurrency(p.priceMonthly)}</TableCell>
                    <TableCell>{p.studentLimit}</TableCell>
                    <TableCell>{p.status}</TableCell>
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

export default PlansPage;