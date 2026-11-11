import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormField from '@/components/forms/FormField';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, Mail } from 'lucide-react';
import { Logo } from '@/assets/logo';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type FormValues = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch {
      toast.error('Could not send reset link. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Check your email</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                If an account exists, we've sent a password reset link. It expires in 30 minutes.
              </p>
              <Link to="/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Forgot password?</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter your email and we'll send you a reset link.</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" placeholder="you@institute.com" {...register('email')} />
                </FormField>
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Send reset link
                </Button>
              </form>
              
              <Link to="/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;