// src/types/student.ts

export type StudentStatus = 'active' | 'inactive' | 'completed' | 'cancelled' | 'alumni';
export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string;              // API returns public_id as the identifier used in URLs
  publicId?: string;
  tenantId?: number;
  branchId: number;
  
  studentCode?: string;
  name: string;            // single name field from DB
  dob?: string | null;     // date
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null; 

  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  photoPath?: string | null;
  admissionDate?: string | null;
  status: StudentStatus;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  // Optional joined relations the API may return
  batchId?: string | number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  
}

export interface Pagination {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}