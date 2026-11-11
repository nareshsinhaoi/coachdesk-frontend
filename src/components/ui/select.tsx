import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'disabled:cursor-not-allowed disabled:bg-slate-50',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
);
Select.displayName = 'Select';

export { Select };
export default Select;