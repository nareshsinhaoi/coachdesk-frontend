import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline';

const variants: Record<Variant, string> = {
  default: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  outline: 'border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300 bg-transparent',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}
    {...props}
  />
);

export { Badge };
export default Badge;