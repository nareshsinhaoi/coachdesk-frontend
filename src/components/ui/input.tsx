import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-slate-400',
        'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
export default Input;