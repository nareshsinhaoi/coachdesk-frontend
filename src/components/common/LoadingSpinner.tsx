import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className, fullScreen }) => {
  const spinner = (
    <svg
      className={cn('animate-spin text-indigo-600', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">{spinner}</div>
    );
  }
  return spinner;
};

export default LoadingSpinner;