import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false);
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative w-full rounded-xl border border-slate-200 bg-white p-6 shadow-xl',
        'dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
  )
);
DialogDescription.displayName = 'DialogDescription';

const DialogClose = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
    aria-label="Close"
  >
    <X className="h-4 w-4" />
  </button>
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter };
export default Dialog;