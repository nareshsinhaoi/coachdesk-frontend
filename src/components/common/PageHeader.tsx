import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, className }) => (
  <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;