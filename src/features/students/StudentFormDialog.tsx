import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/api/students.api';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import FormField from '@/components/forms/FormField';
import { toast } from '@/components/ui/toast';
import type { Batch, Branch, Student } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().min(10, 'Enter a valid phone').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  admissionDate: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  branchId: z.string().min(1, 'Branch is required'),
  batchIds: z.array(z.string()).default([]),
  guardianName: z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'completed', 'cancelled', 'alumni']).default('active'),
});

type FormValues = z.infer<typeof schema>;

const guardianRelationshipOptions = ['Father', 'Mother', 'Guardian', 'Other'];

function toIdList(value?: Array<string | number> | string | number | null): string[] {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value.map((id) => String(id));
  return [String(value)];
}

function normalizeGuardianRelationship(value?: string | null): string {
  const relationship = value?.trim();
  if (!relationship) return 'Father';
  return guardianRelationshipOptions.find(
    (option) => option.toLowerCase() === relationship.toLowerCase()
  ) ?? relationship;
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  batches?: Batch[];
  branches?: Branch[];
}

const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  onOpenChange,
  student,
  batches = [],
  branches = [],
}) => {
  const isEdit = !!student;
  const queryClient = useQueryClient();
  const studentId = student?.public_id ?? student?.id;

  const {
    data: studentDetailsResponse,
    isLoading: isLoadingStudent,
    isError: isStudentDetailsError,
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => {
      if (studentId === undefined) throw new Error('Student ID is required');
      return studentsApi.get(studentId);
    },
    enabled: open && !!student,
  });

  // studentsApi.get already unwraps the API envelope.
  const studentRecord = studentDetailsResponse ?? student;

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', branchId: '', batchIds: [] },
  });

  const selectedBranchId = watch('branchId');
  const selectedBatchIds = watch('batchIds') ?? [];

  // Local state for instant checkbox visual updates
  const [localBatchIds, setLocalBatchIds] = useState<string[]>([]);

  useEffect(() => {
    setLocalBatchIds(selectedBatchIds);
  }, [selectedBatchIds]);

  const batchesForBranch = useMemo(() => {
    if (!selectedBranchId) return [];
    return batches.filter((batch) => {
      const bId = batch.branch_id;
      return String(bId) === String(selectedBranchId);
    });
  }, [batches, selectedBranchId]);

  useEffect(() => {
    if (!open) return;
    if (isLoadingStudent) return;

    if (studentRecord) {
      // Read snake_case values from your exact JSON payload
      const rawBranchId = studentRecord.branch_id ?? studentRecord.branchId;
      const initialBranchId = rawBranchId ? String(rawBranchId) : '';
      const initialBatchIds = toIdList(
        studentRecord.active_batch_ids ??
          studentRecord.batchIds ??
          studentRecord.batch_ids ??
          studentRecord.batchId ??
          studentRecord.batch_id
      );

      reset({
        name: studentRecord.name ?? '',
        dob: studentRecord.dob ?? '',
        gender: (studentRecord.gender as FormValues['gender']) ?? undefined,
        phone: studentRecord.phone ?? '',
        email: studentRecord.email ?? '',
        admissionDate: studentRecord.admission_date ?? studentRecord.admissionDate ?? '',
        addressLine1: studentRecord.address_line1 ?? studentRecord.addressLine1 ?? '',
        addressLine2: studentRecord.address_line2 ?? studentRecord.addressLine2 ?? '',
        city: studentRecord.city ?? '',
        state: studentRecord.state ?? '',
        pincode: studentRecord.pincode ?? '',
        branchId: initialBranchId,
        batchIds: initialBatchIds,
        guardianName: studentRecord.guardian_name ?? studentRecord.guardianName ?? '',
        guardianRelationship: normalizeGuardianRelationship(
          studentRecord.guardian_relationship ?? studentRecord.guardianRelationship
        ),
        guardianPhone: studentRecord.guardian_phone ?? studentRecord.guardianPhone ?? '',
        guardianEmail: studentRecord.guardian_email ?? studentRecord.guardianEmail ?? '',
        status: (studentRecord.status as FormValues['status']) ?? 'active',
      });
    } else {
      reset({
        status: 'active',
        branchId: '',
        batchIds: [],
        guardianRelationship: 'Father'
      });
    }
  }, [open, studentRecord, isLoadingStudent, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        branchId: Number(values.branchId),
        batchIds: values.batchIds.map(Number),
        guardianEmail: values.guardianEmail || undefined,
      };

      return isEdit && student
        ? studentsApi.update(student.public_id ?? student.id, payload)
        : studentsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      if (isEdit && studentId !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      }
      toast.success(isEdit ? 'Student updated' : 'Student admitted');
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Save failed. Please check the form.');
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 w-full max-w-6xl">
        <div
          className="relative max-h-[90vh] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Student' : 'Admit New Student'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {isLoadingStudent && (
              <p role="status" className="text-sm text-blue-500">
                Loading saved student and enrollment details…
              </p>
            )}
            {isStudentDetailsError && (
              <p role="alert" className="text-sm text-red-600">
                Could not load the latest student details. You can still edit the information available here.
              </p>
            )}

            <fieldset disabled={isEdit && isLoadingStudent} className="space-y-6">

              {/* SECTION 1: Student Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Student Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <FormField label="Full Name" error={errors.name?.message} required>
                    <Input {...register('name')} placeholder="e.g. John Doe" />
                  </FormField>
                  <FormField label="Date of Birth" error={errors.dob?.message}>
                    <Input type="date" {...register('dob')} />
                  </FormField>
                  <FormField label="Gender" error={errors.gender?.message}>
                    <Select {...register('gender')}>
                      <option value="">— Select —</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormField>

                  <FormField label="Phone" error={errors.phone?.message}>
                    <Input type="tel" {...register('phone')} />
                  </FormField>
                  <FormField label="Email" error={errors.email?.message}>
                    <Input type="email" {...register('email')} />
                  </FormField>
                  <FormField label="Admission Date" error={errors.admissionDate?.message}>
                    <Input type="date" {...register('admissionDate')} />
                  </FormField>

                  <div className="sm:col-span-2 md:col-span-3">
                    <FormField label="Address line 1" error={errors.addressLine1?.message}>
                      <Input {...register('addressLine1')} />
                    </FormField>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <FormField label="Address line 2" error={errors.addressLine2?.message}>
                      <Input {...register('addressLine2')} />
                    </FormField>
                  </div>

                  <FormField label="City" error={errors.city?.message}>
                    <Input {...register('city')} />
                  </FormField>
                  <FormField label="State" error={errors.state?.message}>
                    <Input {...register('state')} />
                  </FormField>
                  <FormField label="Pincode" error={errors.pincode?.message}>
                    <Input {...register('pincode')} />
                  </FormField>

                  <FormField label="Status" error={errors.status?.message}>
                    <Select {...register('status')}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="alumni">Alumni</option>
                    </Select>
                  </FormField>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* SECTION 2: Enrollment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enrollment</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <FormField label="Branch" error={errors.branchId?.message} required>
                    <Select
                      value={selectedBranchId || ''}
                      onChange={(e) => {
                        setValue('branchId', e.target.value, { shouldValidate: true, shouldDirty: true });
                        setValue('batchIds', [], { shouldDirty: true });
                      }}
                    >
                      <option value="">— Select —</option>
                      {branches.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Batches (optional)" hint="Select one or more batches.">
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-300 p-3 dark:border-slate-700">
                      {!selectedBranchId ? (
                        <p className="text-sm text-slate-500">Select a branch to see its batches.</p>
                      ) : batchesForBranch.length === 0 ? (
                        <p className="text-sm text-slate-500">No batches are available for this branch.</p>
                      ) : (
                        batchesForBranch.map((batch) => {
                          const batchId = String(batch.id);
                          const isChecked = localBatchIds.includes(batchId);

                          return (
                            <label key={batch.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                value={batchId}
                                checked={isChecked}
                                onChange={(event) => {
                                  const nextBatchIds = event.target.checked
                                    ? [...localBatchIds, batchId]
                                    : localBatchIds.filter((id) => id !== batchId);

                                  setLocalBatchIds(nextBatchIds);
                                  setValue('batchIds', nextBatchIds, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>
                                {batch.batch_name || batch.name || `Batch ${batch.id}`}
                                {batch.batch_code ? ` (${batch.batch_code})` : ''}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </FormField>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* SECTION 3: Guardian */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Guardian</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <FormField label="Guardian Name" error={errors.guardianName?.message}>
                    <Input {...register('guardianName')} />
                  </FormField>
                  <FormField label="Relationship" error={errors.guardianRelationship?.message}>
                    <Select {...register('guardianRelationship')}>
                      {guardianRelationshipOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Guardian Phone" error={errors.guardianPhone?.message}>
                    <Input type="tel" {...register('guardianPhone')} />
                  </FormField>

                  <div className="sm:col-span-2 md:col-span-3">
                    <FormField label="Guardian Email" error={errors.guardianEmail?.message}>
                      <Input type="email" {...register('guardianEmail')} />
                    </FormField>
                  </div>
                </div>
              </div>
            </fieldset>

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                {isEdit ? 'Save changes' : 'Admit Student'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentFormDialog;