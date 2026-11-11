import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, RefreshCw, Save, Building2 } from 'lucide-react';
import { settingsApi } from '@/api/admin.api';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { InstituteSettings } from '@/types';

type TenantForm = NonNullable<InstituteSettings['tenant']>;

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<TenantForm>>({});
  const [branding, setBranding] = useState<{ primary_color: string; receipt_footer: string }>({
    primary_color: '#4f46e5',
    receipt_footer: '',
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  useEffect(() => {
    if (data) {
      setForm(data.tenant);
      const b = (data.settings.branding ?? {}) as Record<string, unknown>;
      setBranding({
        primary_color: (b.primary_color as string) || '#4f46e5',
        receipt_footer: (b.receipt_footer as string) || '',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => settingsApi.save({ tenant: form, settings: { branding } }),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Save failed');
    },
  });

  const setT = (k: keyof TenantForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const field = (
    label: string,
    key: keyof TenantForm,
    props: { type?: string; disabled?: boolean; placeholder?: string; required?: boolean } = {},
  ) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <Input
        value={(form[key] as string) ?? ''}
        onChange={setT(key)}
        {...props}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-slate-500">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Institute Settings"
        description="Institute profile, branding and receipt preferences."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? 'Saving…' : 'Save Settings'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Institute profile */}
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Institute Profile
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field('Institute Name *', 'name', { required: true })}
              {field('Code', 'code', { disabled: true })}
              {field('Email', 'email', { type: 'email' })}
              {field('Phone', 'phone')}
              {field('Website', 'website')}
              {field('Address', 'address_line1')}
              {field('City', 'city')}
              {field('State', 'state')}
              {field('Pincode', 'pincode')}
              {field('Country', 'country')}
              {field('Timezone', 'timezone', { placeholder: 'e.g. Asia/Kolkata' })}
              {field('Currency', 'currency', { placeholder: 'e.g. INR' })}
            </div>
            {data?.tenant?.status && (
              <div className="mt-4">
                <Badge variant={data.tenant.status === 'active' ? 'success' : 'secondary'}>
                  Subscription: {data.tenant.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Settings className="h-4 w-4 text-indigo-600" />
              Branding & Receipts
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
                  />
                  <Input
                    value={branding.primary_color}
                    onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Receipt Footer Text
                </label>
                <Input
                  value={branding.receipt_footer}
                  onChange={(e) => setBranding((b) => ({ ...b, receipt_footer: e.target.value }))}
                  placeholder="e.g. Thank you for your payment!"
                />
              </div>
              <p className="text-xs text-slate-500">
                These appear on generated fee receipts (PDF).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
