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
import { CheckCircle2 } from 'lucide-react';
import { Logo } from '@/assets/logo';

const schema = z.object({
  instituteName: z.string().min(2, 'Required'),
  ownerName: z.string().min(2, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone'),
  message: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.register(values);
      setSubmitted(true);
    } catch {
      toast.error('Could not submit request. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Request received</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Our team will contact you within 24 hours to set up your institute account.
              </p>
              <Link to="/login" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Back to login
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Register your institute</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell us about your coaching centre.</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <FormField label="Institute name" htmlFor="instituteName" error={errors.instituteName?.message} required>
                  <Input id="instituteName" {...register('instituteName')} />
                </FormField>
                <FormField label="Your name" htmlFor="ownerName" error={errors.ownerName?.message} required>
                  <Input id="ownerName" {...register('ownerName')} />
                </FormField>
                <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" {...register('email')} />
                </FormField>
                <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
                  <Input id="phone" {...register('phone')} />
                </FormField>
                <FormField label="Message (optional)" htmlFor="message">
                  <textarea
                    id="message"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register('message')}
                  />
                </FormField>
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Request access
                </Button>
              </form>
              
              <Link to="/login" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Already have an account? Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;