import React, { useEffect } from 'react';
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
  batchId: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'completed', 'cancelled', 'alumni']).default('active'),
});

type FormValues = z.infer<typeof schema>;

const guardianRelationshipOptions = ['Father', 'Mother', 'Guardian', 'Other'];

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
    data: studentDetails,
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
  const studentRecord = studentDetails ?? student;
  const guardianRelationship = normalizeGuardianRelationship(
    studentRecord?.guardianRelationship ?? studentRecord?.guardian_relationship
  );

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', branchId: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (studentRecord) {
      reset({
        name: studentRecord.name ?? '',
        dob: studentRecord.dob ?? '',
        gender: (studentRecord.gender as FormValues['gender']) ?? undefined,
        phone: studentRecord.phone ?? '',
        email: studentRecord.email ?? '',
        admissionDate: studentRecord.admissionDate ?? studentRecord.admission_date ?? '',
        addressLine1: studentRecord.addressLine1 ?? studentRecord.address_line1 ?? '',
        addressLine2: studentRecord.addressLine2 ?? studentRecord.address_line2 ?? '',
        city: studentRecord.city ?? '',
        state: studentRecord.state ?? '',
        pincode: studentRecord.pincode ?? '',
        branchId:
          studentRecord.branchId || studentRecord.branch_id
            ? String(studentRecord.branchId ?? studentRecord.branch_id)
            : '',
        batchId: studentRecord.batchId != null || studentRecord.batch_id != null
          ? String(studentRecord.batchId ?? studentRecord.batch_id)
          : '',
        guardianName: studentRecord.guardianName ?? studentRecord.guardian_name ?? '',
        guardianRelationship,
        guardianPhone: studentRecord.guardianPhone ?? studentRecord.guardian_phone ?? '',
        guardianEmail: studentRecord.guardianEmail ?? studentRecord.guardian_email ?? '',
        status: (studentRecord.status as FormValues['status']) ?? 'active',
      });
    } else {
      reset({
        status: 'active',
        branchId: '',
        guardianRelationship: 'Father'
      });
    }
  }, [open, studentRecord, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        branchId: Number(values.branchId),
        batchId: values.batchId ? Number(values.batchId) : null,
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
    onError: () => toast.error('Save failed. Please check the form.'),
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 w-full max-w-7xl">
        <div
          className="relative max-h-[90vh] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Student' : 'Admit New Student'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isLoadingStudent && (
              <p role="status" className="text-sm text-slate-500">
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
              {/* Changed to sm:grid-cols-3 for 3 fields per row */}
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
                  <Select {...register('branchId')}>
                    <option value="">— Select —</option>
                    {branches.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Batch (optional)" error={errors.batchId?.message}>
                  <Select {...register('batchId')}>
                    <option value="">— Not assigned —</option>
                    {batches.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.batch_name || b.name || `Batch ${b.id}`}
                        {b.batch_code ? ` (${b.batch_code})` : ''}
                      </option>
                    ))}
                  </Select>
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
                    {!guardianRelationshipOptions.includes(guardianRelationship) && (
                      <option value={guardianRelationship}>{guardianRelationship}</option>
                    )}
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