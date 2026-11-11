import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormField from '@/components/forms/FormField';
import { toast } from '@/components/ui/toast';
import { Logo } from '@/assets/logo';

const schema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error('Missing reset token. Please use the link from your email.');
      return;
    }
    try {
      await authApi.resetPassword({ token, password: values.password });
      toast.success('Password updated. Please sign in.');
      navigate('/login');
    } catch {
      toast.error('Reset failed. The link may have expired.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Set a new password</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a strong password you haven't used before.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField label="New password" htmlFor="password" error={errors.password?.message} required>
              <Input id="password" type="password" {...register('password')} />
            </FormField>
            <FormField label="Confirm password" htmlFor="confirm" error={errors.confirmPassword?.message} required>
              <Input id="confirm" type="password" {...register('confirmPassword')} />
            </FormField>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Update password
            </Button>
          </form>
          
          <Link to="/login" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;