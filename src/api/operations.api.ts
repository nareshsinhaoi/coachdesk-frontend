import { apiClient } from './client';
import type {
  ApiResponse,
  AttendanceSession,
  AttendanceMarkData,
  AttendanceStatus,
  FeeStudentSummary,
  Payment,
  Exam,
  ExamBatchOption,
  ExamMarkEntry,
  ReportData,
  ProfileData,
} from '@/types';

const unwrap = <T>(payload: ApiResponse<T>): T => payload.data;

export const attendanceApi = {
  sessions: async (date: string): Promise<{ date: string; sessions: AttendanceSession[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ date: string; sessions: AttendanceSession[] }>>(
      '/attendance',
      { params: { date } },
    );
    return unwrap(data);
  },

  roster: async (batchId: number, date: string): Promise<AttendanceMarkData> => {
    const { data } = await apiClient.get<ApiResponse<AttendanceMarkData>>('/attendance/mark', {
      params: { batch_id: batchId, date },
    });
    return unwrap(data);
  },

  save: async (payload: {
    batch_id: number;
    attendance_date: string;
    status: Record<string | number, AttendanceStatus>;
  }): Promise<{ saved: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ saved: number }>>('/attendance/save', payload);
    return unwrap(data);
  },
};

export const feesApi = {
  summary: async (params?: {
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ students: FeeStudentSummary[]; payments: Payment[] }> => {
    const { data } = await apiClient.get<
      ApiResponse<{ students: FeeStudentSummary[]; payments: Payment[] }>
    >('/fees', { params });
    return unwrap(data);
  },

  collect: async (payload: {
    student_id: number;
    amount: number;
    method: string;
    payment_date?: string;
    notes?: string;
  }): Promise<{ public_id: string; receipt_number: string; amount: number; method: string; payment_date: string }> => {
    const { data } = await apiClient.post<ApiResponse<{
      public_id: string;
      receipt_number: string;
      amount: number;
      method: string;
      payment_date: string;
    }>>('/fees/collect', payload);
    return unwrap(data);
  },
};

export const examsApi = {
  list: async (): Promise<{ exams: Exam[]; batches: ExamBatchOption[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ exams: Exam[]; batches: ExamBatchOption[] }>>('/exams');
    return unwrap(data);
  },

  create: async (payload: { batch_id: number; exam_name: string; exam_date?: string }): Promise<Exam> => {
    const { data } = await apiClient.post<ApiResponse<Exam>>('/exams', payload);
    return unwrap(data);
  },

  marks: async (
    examPublicId: string,
  ): Promise<{
    exam: { public_id: string; exam_name: string; exam_date: string; batch_name: string };
    students: Array<{ id: number; public_id: string; student_code: string; name: string }>;
    results: Record<string, ExamMarkEntry>;
  }> => {
    const { data } = await apiClient.get<ApiResponse<{
      exam: { public_id: string; exam_name: string; exam_date: string; batch_name: string };
      students: Array<{ id: number; public_id: string; student_code: string; name: string }>;
      results: Record<string, ExamMarkEntry>;
    }>>(`/exams/${examPublicId}/marks`);
    return unwrap(data);
  },

  saveMarks: async (
    examPublicId: string,
    marks: Record<string | number, ExamMarkEntry>,
  ): Promise<{ saved: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ saved: number }>>(
      `/exams/${examPublicId}/marks`,
      { marks },
    );
    return unwrap(data);
  },
};

export const reportsApi = {
  overview: async (): Promise<ReportData> => {
    const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports');
    return unwrap(data);
  },
};

export const profileApi = {
  me: async (): Promise<ProfileData> => {
    const { data } = await apiClient.get<ApiResponse<ProfileData>>('/auth/me');
    return unwrap(data);
  },

  update: async (payload: { name?: string; email?: string }): Promise<ProfileData> => {
    const { data } = await apiClient.put<ApiResponse<ProfileData>>('/auth/profile', payload);
    return unwrap(data);
  },

  changePassword: async (payload: {
    current_password: string;
    new_password: string;
  }): Promise<void> => {
    await apiClient.post('/auth/change-password', payload);
  },
};
