import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, hint, required, className, children }) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
    ) : hint ? (
      <p className="text-xs text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export default FormField;