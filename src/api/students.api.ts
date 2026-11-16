import apiClient from './client';
import type { ApiResponse, Student, Pagination } from '@/types';

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  batchId?: string;
  branchId?: string;
}

export interface StudentInput {
  name: string;
  branchId: string | number;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  status?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  batchId?: string | number | null;
  batchIds?: Array<string | number> | null;
  admissionDate?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianPhone?: string;
  guardianEmail?: string;
}

function toWireParams(params: StudentListParams) {
  return {
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
    batch_id: params.batchId,
    branch_id: params.branchId,
  };
}

export const studentsApi = {
  async list(params: StudentListParams = {}): Promise<{ data: Student[]; pagination: Pagination }> {
    const { data } = await apiClient.get<ApiResponse<Student[]>>('/students', {
      params: toWireParams(params),
    });
    return { data: data.data, pagination: data.pagination as Pagination };
  },

  async get(publicId: string | number): Promise<Student> {
    const { data } = await apiClient.get<ApiResponse<Student>>(`/students/${publicId}`);
    return data.data;
  },

  async create(payload: StudentInput): Promise<Student> {
    const { data } = await apiClient.post<ApiResponse<Student>>('/students', {
      name: payload.name,
      branch_id: payload.branchId,
      email: payload.email,
      phone: payload.phone,
      dob: payload.dob,
      gender: payload.gender,
      status: payload.status,
      address_line1: payload.addressLine1,
      address_line2: payload.addressLine2,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      batch_ids: payload.batchIds !== undefined
        ? (payload.batchIds ?? []).map(Number)
        : payload.batchId != null
          ? [Number(payload.batchId)]
          : [],
      admission_date: payload.admissionDate,
      guardian_name: payload.guardianName,
      guardian_relationship: payload.guardianRelationship,
      guardian_phone: payload.guardianPhone,
      guardian_email: payload.guardianEmail,
    });
    return data.data;
  },

  async update(publicId: string | number, payload: Partial<StudentInput>): Promise<Student> {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined)         body.name = payload.name;
    if (payload.branchId !== undefined)     body.branch_id = payload.branchId;
    if (payload.email !== undefined)        body.email = payload.email;
    if (payload.phone !== undefined)        body.phone = payload.phone;
    if (payload.dob !== undefined)          body.dob = payload.dob;
    if (payload.gender !== undefined)       body.gender = payload.gender;
    if (payload.status !== undefined)       body.status = payload.status;
    if (payload.addressLine1 !== undefined) body.address_line1 = payload.addressLine1;
    if (payload.addressLine2 !== undefined) body.address_line2 = payload.addressLine2;
    if (payload.city !== undefined)         body.city = payload.city;
    if (payload.state !== undefined)        body.state = payload.state;
    if (payload.pincode !== undefined)      body.pincode = payload.pincode;
    // Enrollment is stored in cd_batch_students; the API replaces active enrollments.
    if (payload.batchIds !== undefined) {
      body.batch_ids = (payload.batchIds ?? []).map((id) => Number(id));
    } else if (payload.batchId !== undefined) {
      body.batch_ids = payload.batchId ? [Number(payload.batchId)] : [];
    }
    if (payload.admissionDate !== undefined) body.admission_date = payload.admissionDate;

    if (payload.guardianName !== undefined) body.guardian_name = payload.guardianName;
    if (payload.guardianRelationship !== undefined) body.guardian_relationship = payload.guardianRelationship;
    if (payload.guardianPhone !== undefined) body.guardian_phone = payload.guardianPhone;
    if (payload.guardianEmail !== undefined) body.guardian_email = payload.guardianEmail;

    const { data } = await apiClient.put<ApiResponse<Student>>(`/students/${publicId}`, body);
    return data.data;
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },
};