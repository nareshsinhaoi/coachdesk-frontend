export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  errors?: Record<string, string>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  tenant_id?: number | null;
  branch_id?: number | null;
  role?: string;
  roles?: string[];
  permissions?: string[];
  is_super_admin?: boolean | number;
  isSuperAdmin?: boolean;
  avatar?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Student {
  id: number;
  public_id: string;
  student_code: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  admission_date?: string;
  branch_name?: string;
  branch_code?: string;
}

export interface Batch {
  id: string | number;
  public_id: string;
  tenant_id?: string | number;
  branch_id?: string | number;
  course_id?: string | number;
  academic_session_id?: string | number;
  batch_name: string;
  name?: string;
  batch_code: string;
  code?: string;
  capacity: string | number;
  start_date?: string | null;
  end_date?: string | null;
  timing_start?: string | null;
  timing_end?: string | null;
  status: 'running' | 'upcoming' | 'completed' | 'cancelled' | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  course_name?: string;
  course_code?: string;
}

export interface BatchListParams {
  page?: number;
  perPage?: number;
  limit?: number;
  search?: string;
  status?: string;
  course_id?: string | number;
}

export interface Teacher {
  id: string | number;
  public_id: string;
  tenant_id?: string | number | null;
  branch_id?: string | number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  qualification?: string | null;
  experience_years?: string | number | null;
  status: 'active' | 'inactive' | string;
  joining_date?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  branch_name?: string;
}

export interface TeacherListParams {
  page?: number;
  perPage?: number;
  limit?: number;
  search?: string;
  status?: string;
  subject?: string;
}

export interface Course {
  id: string | number;
  public_id: string;
  tenant_id?: string | number | null;
  branch_id?: string | number | null;
  course_name: string;
  course_code: string;
  name?: string;
  code?: string;
  duration?: string | number | null;
  fees?: string | number | null;
  description?: string | null;
  status: 'active' | 'inactive' | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CourseListParams {
  page?: number;
  perPage?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface DashboardStats {
  students?: {
    total: number;
    active: number;
    new_this_month: number;
  };
  teachers?: { total: number };
  batches?: {
    total: number;
    running: number;
    upcoming: number;
    completed: number;
  };
  attendance_today?: {
    present: number;
    absent: number;
    late: number;
    total_marked: number;
  };
  fees?: {
    collected_today: number;
    collected_month: number;
    outstanding: number;
    defaulters_count: number;
  };
  recent_payments?: Array<{
    public_id: string;
    receipt_number: string;
    amount: string;
    method: string;
    payment_date: string;
    student_name: string;
  }>;
  upcoming_exams?: Array<{
    public_id: string;
    exam_name: string;
    exam_date: string;
    batch_name: string;
  }>;
  monthly_collection?: Array<{ month: string; total: number }>;
  admissions_chart?: Array<{ month: string; count: number }>;
}
/* ================= OPERATIONS MODULES ================= */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

export interface AttendanceSession {
  id: number;
  public_id: string;
  attendance_date: string;
  status: string;
  batch_name: string;
  batch_code?: string;
  present_count: number | string;
  absent_count: number | string;
  late_count?: number | string;
  total_marked: number | string;
}

export interface AttendanceRosterStudent {
  id: number;
  public_id: string;
  student_code: string;
  name: string;
}

export interface AttendanceMarkData {
  date: string;
  session: { public_id: string; status: string } | null;
  batch: { public_id: string; batch_name: string };
  students: AttendanceRosterStudent[];
  marked: Record<string, AttendanceStatus>;
}

export interface Payment {
  public_id: string;
  receipt_number: string;
  payment_date: string;
  amount: string | number;
  method: string;
  status: string;
  notes?: string | null;
  student_name: string;
  student_code?: string;
}

export interface FeeStudentSummary {
  id: number;
  public_id: string;
  student_code: string;
  name: string;
  total_fees: number | string;
  paid_amount: number | string;
  due_amount: number | string;
}

export interface Exam {
  id: number;
  public_id: string;
  exam_name: string;
  exam_date: string;
  status: string;
  batch_id: number;
  batch_name: string;
  result_count: number | string;
}

export interface ExamBatchOption {
  id: number;
  public_id: string;
  batch_name: string;
}

export interface ExamMarkEntry {
  marks_obtained: string | number;
  total_marks: string | number;
  grade?: string | null;
  remarks?: string | null;
}

export interface ReportData {
  fee_monthly: Array<{ ym: string; total: string | number }>;
  attendance_by_batch: Array<{
    batch_name: string;
    present: number | string;
    absent: number | string;
    late?: number | string;
    total: number | string;
  }>;
  exam_stats: Array<{
    batch_name: string;
    students_graded: number | string;
    avg_percentage: number | string | null;
  }>;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  tenant_id?: number | null;
}

/* ================= ADMIN MODULES (branches/users/settings) ================= */

export interface Branch {
  id: number;
  public_id: string;
  name: string;
  branch_code: string;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'active' | 'inactive' | string;
  staff_count?: number | string;
  student_count?: number | string;
  created_at?: string;
}

export interface BranchPayload {
  name: string;
  branch_code?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export interface StaffUser {
  id: number;
  public_id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: 'active' | 'inactive' | 'locked' | string;
  last_login_at?: string | null;
  branch_id?: number | null;
  branch_name?: string | null;
  roles?: string | null;
  created_at?: string;
}

export interface RoleOption {
  id: number;
  name: string;
  slug: string;
}

export interface UserFormOptions {
  roles: RoleOption[];
  branches: Array<{ id: number; public_id: string; name: string }>;
}

export interface InstituteSettings {
  tenant: {
    id: number;
    public_id: string;
    name: string;
    code: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
    timezone?: string | null;
    currency?: string | null;
    status?: string;
  };
  settings: Record<string, unknown>;
}
