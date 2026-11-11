import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/api/courses.api';
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
import type { Course } from '@/types';

const schema = z.object({
  course_name: z.string().min(2, 'Course name must be at least 2 characters'),
  course_code: z.string().min(1, 'Course code is required'),
  duration: z.string().optional(),
  fees: z.string().refine((value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0), {
    message: 'Fees must be a non-negative number',
  }),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FormValues = z.infer<typeof schema>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

const CourseFormDialog: React.FC<CourseFormDialogProps> = ({
  open,
  onOpenChange,
  course,
}) => {
  const isEdit = !!course;
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
        course_name: course?.course_name ?? course?.name ?? '',
        course_code: course?.course_code ?? course?.code ?? '',
        duration: course?.duration != null ? String(course.duration) : '',
        fees: course?.fees != null ? String(course.fees) : '',
        description: course?.description ?? '',
        status: course?.status === 'inactive' ? 'inactive' : 'active',
      });
    }
  }, [open, course, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        duration: values.duration || null,
        fees: values.fees ? Number(values.fees) : null,
      };
      if (isEdit && course) {
        return coursesApi.update(course.public_id || String(course.id), payload);
      }
      return coursesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(isEdit ? 'Course updated successfully' : 'Course created successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Operation failed');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Course' : 'Add New Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Course Name" required error={errors.course_name?.message}>
              <Input placeholder="e.g. IIT-JEE Foundation" {...register('course_name')} />
            </FormField>
            <FormField label="Course Code" required error={errors.course_code?.message}>
              <Input placeholder="e.g. JEE-FDN" {...register('course_code')} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Duration" error={errors.duration?.message}>
              <Input placeholder="e.g. 12 months" {...register('duration')} />
            </FormField>
            <FormField label="Fees" error={errors.fees?.message}>
              <Input type="number" min={0} step="0.01" placeholder="e.g. 25000" {...register('fees')} />
            </FormField>
          </div>
          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Optional details about this course"
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormDialog;
