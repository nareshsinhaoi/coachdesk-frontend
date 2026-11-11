import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/api/students.api';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import FormField from '@/components/forms/FormField';
import { toast } from '@/components/ui/toast';
import type { Student } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Enter a valid phone'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  batchId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'alumni']).default('active'),
});
type FormValues = z.infer<typeof schema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  batches?: { id: string; name: string }[];
}

const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  onOpenChange,
  student,
  batches = [],
}) => {
  const isEdit = !!student;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  });

  useEffect(() => {
    if (open) {
      reset({
        firstName: student?.firstName ?? '',
        lastName: student?.lastName ?? '',
        email: student?.email ?? '',
        phone: student?.phone ?? '',
        dateOfBirth: student?.dateOfBirth ?? '',
        gender: (student?.gender as FormValues['gender']) ?? undefined,
        guardianName: student?.guardianName ?? '',
        guardianPhone: student?.guardianPhone ?? '',
        address: student?.address ?? '',
        batchId: student?.batchId ?? '',
        status: (student?.status as FormValues['status']) ?? 'active',
      });
    }
  }, [open, student, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit && student ? studentsApi.update(student.id, values) : studentsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(isEdit ? 'Student updated' : 'Student admitted');
      onOpenChange(false);
    },
    onError: () => toast.error('Save failed. Please check the form.'),
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit student' : 'Admit new student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First name" error={errors.firstName?.message} required>
              <Input {...register('firstName')} />
            </FormField>
            <FormField label="Last name" error={errors.lastName?.message} required>
              <Input {...register('lastName')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message} required>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="Date of birth" error={errors.dateOfBirth?.message}>
              <Input type="date" {...register('dateOfBirth')} />
            </FormField>
            <FormField label="Gender" error={errors.gender?.message}>
              <Select {...register('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="Guardian name" error={errors.guardianName?.message}>
              <Input {...register('guardianName')} />
            </FormField>
            <FormField label="Guardian phone" error={errors.guardianPhone?.message}>
              <Input {...register('guardianPhone')} />
            </FormField>
            <FormField label="Batch" error={errors.batchId?.message}>
              <Select {...register('batchId')}>
                <option value="">Unassigned</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
              {...register('address')}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Admit student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;