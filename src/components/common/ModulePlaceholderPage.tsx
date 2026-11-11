import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from './PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface ModulePlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({
  title,
  description,
  icon: Icon,
  badge = 'Active Module',
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        }
      />

      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Icon className="h-8 w-8" />
          </div>

          <span className="mt-4 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {badge}
          </span>

          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
            {title} Management
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/dashboard">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulePlaceholderPage;

