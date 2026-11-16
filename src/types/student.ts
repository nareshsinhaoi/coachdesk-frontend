// src/types/student.ts

export type StudentStatus = 'active' | 'inactive' | 'completed' | 'cancelled' | 'alumni';
export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string | number;
  public_id?: string;
  tenant_id?: string | number;
  branch_id?: string | number;
  
  student_code?: string;
  name: string;
  dob?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null; 

  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  photo_path?: string | null;
  admission_date?: string | null;
  status: StudentStatus;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // Joined relations returned by API
  branch_code?: string | null;
  branch_name?: string | null;
  
  // Guardian fields (snake_case from API)
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  guardian_occupation?: string | null;

  // The crucial array for the batches
  active_batch_ids?: Array<string | number>;

  // CamelCase fallbacks for frontend mapping
  branchId?: string | number | null;
  branchName?: string | null;
  studentCode?: string | null;
  admissionDate?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  photoPath?: string | null;
  batchId?: string | number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
}

export interface Pagination {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}