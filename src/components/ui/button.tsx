import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  default:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 disabled:bg-indigo-300',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost:
    'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-800',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300',
  link: 'text-indigo-600 underline-offset-4 hover:underline',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 py-2.5 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button };
export default Button;