import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface AuditLog {
  id: number;
  actorEmail: string;
  action: string;
  entity: string;
  createdAt: string;
}

const AuditLogsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await apiClient.get('/super-admin/audit-logs');
      return res.data;
    },
  });
  const logs: AuditLog[] = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Audit logs" description="Every important action on the platform." />
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : logs.length === 0 ? (
            <EmptyState title="No audit logs" description="Audit entries will appear as users act." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.actorEmail}</TableCell>
                    <TableCell>{l.action}</TableCell>
                    <TableCell className="text-slate-500">{l.entity}</TableCell>
                    <TableCell className="text-slate-500">{formatDate(l.createdAt)}</TableCell>
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

export default AuditLogsPage;