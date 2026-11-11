import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  description = 'There is no data to display.',
  actionLabel,
  onAction,
  icon,
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
      {icon ?? <Inbox className="h-6 w-6" />}
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {actionLabel && onAction && (
      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;