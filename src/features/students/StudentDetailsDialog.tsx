import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '@/api/students.api';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Batch, Branch, Student } from '@/types';

interface StudentDetailsDialogProps {
  student: Student | null;
  onClose: () => void;
  batches: Batch[];
  branches: Branch[];
}

const Detail: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-1 break-words text-sm text-slate-800 dark:text-slate-200">{value || '—'}</dd>
  </div>
);

const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  student,
  onClose,
  batches,
  branches,
}) => {
  const studentId = student?.public_id ?? student?.id;
  const { data: details, isLoading, isError } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => {
      if (studentId === undefined) throw new Error('Student ID is required');
      return studentsApi.get(studentId);
    },
    enabled: !!student,
  });

  if (!student) return null;

  const record = details ?? student;
  const branchName =
    record.branchName ||
    record.branch_name ||
    branches.find((branch) => String(branch.id) === String(record.branchId ?? record.branch_id))?.name ||
    '—';
  const batch = batches.find((item) => String(item.id) === String(record.batchId ?? record.batch_id));
  const batchName =
    record.batchName ||
    record.batch_name ||
    (batch ? `${batch.batch_name || batch.name || `Batch ${batch.id}`}${batch.batch_code ? ` (${batch.batch_code})` : ''}` : '—');
  const address = [
    record.addressLine1 ?? record.address_line1,
    record.addressLine2 ?? record.address_line2,
    record.city,
    record.state,
    record.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()} closeOnOutsideClick={false}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogClose onClose={onClose} />
        </DialogHeader>

        {isLoading && <LoadingSpinner />}
        {isError && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            Could not load the latest student details. Showing the information available in the list.
          </p>
        )}

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Student Details</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Detail label="Full name" value={record.name} />
            <Detail label="Student code" value={record.studentCode ?? record.student_code} />
            <Detail label="Date of birth" value={record.dob?.split('T')[0]} />
            <Detail label="Gender" value={record.gender} />
            <Detail label="Phone" value={record.phone} />
            <Detail label="Email" value={record.email} />
            <Detail label="Admission date" value={(record.admissionDate ?? record.admission_date)?.split('T')[0]} />
            <Detail label="Status" value={record.status} />
            <div className="sm:col-span-2 md:col-span-3">
              <Detail label="Address" value={address} />
            </div>
          </dl>
        </section>

        <hr className="my-5 border-slate-200 dark:border-slate-800" />

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enrollment</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Branch" value={branchName} />
            <Detail label="Batch" value={batchName} />
          </dl>
        </section>

        <hr className="my-5 border-slate-200 dark:border-slate-800" />

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Guardian Details</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Detail label="Guardian name" value={record.guardianName ?? record.guardian_name} />
            <Detail label="Relationship" value={record.guardianRelationship ?? record.guardian_relationship} />
            <Detail label="Phone" value={record.guardianPhone ?? record.guardian_phone} />
            <Detail label="Email" value={record.guardianEmail ?? record.guardian_email} />
          </dl>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialog;
