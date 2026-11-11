import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ForbiddenPage: React.FC = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
      <ShieldAlert className="h-7 w-7" />
    </div>
    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Access denied</h1>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      You don't have permission to view this page. Contact your institute admin if you think this is a mistake.
    </p>
    <Link to="/dashboard" className="mt-6">
      <Button>Back to dashboard</Button>
    </Link>
  </div>
);

export default ForbiddenPage;