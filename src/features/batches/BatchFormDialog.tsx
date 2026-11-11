import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesApi } from '@/api/batches.api';
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
import type { Batch } from '@/types';

const schema = z.object({
  batch_name: z.string().min(2, 'Batch name must be at least 2 characters'),
  batch_code: z.string().min(1, 'Batch code is required'),
  course_name: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').default(30),
  status: z.enum(['running', 'upcoming', 'completed', 'cancelled']).default('running'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  timing_start: z.string().optional().or(z.literal('')),
  timing_end: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface BatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch?: Batch | null;
}

const BatchFormDialog: React.FC<BatchFormDialogProps> = ({
  open,
  onOpenChange,
  batch,
}) => {
  const isEdit = !!batch;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'running',
      capacity: 30,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        batch_name: batch?.batch_name ?? batch?.name ?? '',
        batch_code: batch?.batch_code ?? batch?.code ?? '',
        course_name: batch?.course_name ?? '',
        capacity: Number(batch?.capacity) || 30,
        status: (batch?.status as any) || 'running',
        start_date: batch?.start_date ? batch.start_date.split('T')[0] : '',
        end_date: batch?.end_date ? batch.end_date.split('T')[0] : '',
        timing_start: batch?.timing_start ? batch.timing_start.slice(0, 5) : '',
        timing_end: batch?.timing_end ? batch.timing_end.slice(0, 5) : '',
      });
    }
  }, [open, batch, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Partial<Batch> = {
        ...values,
        capacity: values.capacity,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        timing_start: values.timing_start ? `${values.timing_start}:00` : null,
        timing_end: values.timing_end ? `${values.timing_end}:00` : null,
      };

      if (isEdit && batch) {
        return batchesApi.update(batch.public_id || String(batch.id), payload);
      }
      return batchesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success(isEdit ? 'Batch updated successfully' : 'Batch created successfully');
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
          <DialogTitle>{isEdit ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Batch Name" required error={errors.batch_name?.message}>
              <Input
                placeholder="e.g. JEE Foundation - Weekend"
                {...register('batch_name')}
              />
            </FormField>

            <FormField label="Batch Code" required error={errors.batch_code?.message}>
              <Input
                placeholder="e.g. JEE-WE"
                {...register('batch_code')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Course Name" error={errors.course_name?.message}>
              <Input
                placeholder="e.g. IIT-JEE Foundation"
                {...register('course_name')}
              />
            </FormField>

            <FormField label="Student Capacity" required error={errors.capacity?.message}>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 30"
                {...register('capacity')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Status" error={errors.status?.message}>
              <Select {...register('status')}>
                <option value="running">Running</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormField>

            <FormField label="Start Date" error={errors.start_date?.message}>
              <Input type="date" {...register('start_date')} />
            </FormField>

            <FormField label="End Date" error={errors.end_date?.message}>
              <Input type="date" {...register('end_date')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Start Time" error={errors.timing_start?.message}>
              <Input type="time" {...register('timing_start')} />
            </FormField>

            <FormField label="End Time" error={errors.timing_end?.message}>
              <Input type="time" {...register('timing_end')} />
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
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchFormDialog;

