import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '@/api/tenants.api';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const TenantsPage: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['tenants'], queryFn: () => tenantsApi.list() });
  const tenants = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Tenants" description="All institutes on the platform." />
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : tenants.length === 0 ? (
            <EmptyState title="No tenants yet" description="Tenants will appear once institutes register." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institute</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.ownerEmail}</TableCell>
                    <TableCell>{t.planName ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'active' ? 'success' : 'danger'}>{t.status}</Badge>
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

export default TenantsPage;