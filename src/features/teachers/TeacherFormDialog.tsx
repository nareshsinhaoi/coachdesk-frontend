import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersApi } from '@/api/teachers.api';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import FormField from '@/components/forms/FormField';
import { toast } from '@/components/ui/toast';
import type { Teacher } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  subject: z.string().optional().or(z.literal('')),
  qualification: z.string().optional().or(z.literal('')),
  experience_years: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  joining_date: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher | null;
}

const TeacherFormDialog: React.FC<TeacherFormDialogProps> = ({
  open,
  onOpenChange,
  teacher,
}) => {
  const isEdit = !!teacher;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: teacher?.name ?? '',
        email: teacher?.email ?? '',
        phone: teacher?.phone ?? '',
        subject: teacher?.subject ?? '',
        qualification: teacher?.qualification ?? '',
        experience_years: teacher?.experience_years ? Number(teacher.experience_years) : undefined,
        status: (teacher?.status as 'active' | 'inactive') || 'active',
        joining_date: teacher?.joining_date ? teacher.joining_date.split('T')[0] : '',
      });
    }
  }, [open, teacher, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Partial<Teacher> = {
        ...values,
        email: values.email || null,
        phone: values.phone || null,
        subject: values.subject || null,
        qualification: values.qualification || null,
        joining_date: values.joining_date || null,
        experience_years: values.experience_years ?? null,
      };

      if (isEdit && teacher) {
        return teachersApi.update(teacher.public_id || String(teacher.id), payload);
      }
      return teachersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success(isEdit ? 'Teacher updated successfully' : 'Teacher added successfully');
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Operation failed');
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required error={errors.name?.message}>
              <Input
                placeholder="e.g. Dr. Ramesh Kumar"
                {...register('name')}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="e.g. teacher@school.com"
                {...register('email')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone" error={errors.phone?.message}>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                {...register('phone')}
              />
            </FormField>

            <FormField label="Subject" error={errors.subject?.message}>
              <Input
                placeholder="e.g. Mathematics"
                {...register('subject')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Qualification" error={errors.qualification?.message}>
              <Input
                placeholder="e.g. M.Sc Physics, B.Ed"
                {...register('qualification')}
              />
            </FormField>

            <FormField label="Experience (Years)" error={errors.experience_years?.message}>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 5"
                {...register('experience_years')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Status" error={errors.status?.message}>
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormField>

            <FormField label="Joining Date" error={errors.joining_date?.message}>
              <Input type="date" {...register('joining_date')} />
            </FormField>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Teacher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherFormDialog;

