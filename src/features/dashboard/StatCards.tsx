import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCard {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
  accent?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'red';
  subtext?: string;
}

const accents = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'group-hover:border-amber-300 dark:group-hover:border-amber-800',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/50',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'group-hover:border-sky-300 dark:group-hover:border-sky-800',
  },
  red: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'group-hover:border-rose-300 dark:group-hover:border-rose-800',
  },
};

interface StatCardsProps {
  stats: StatCard[];
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map((s) => {
      const Icon = s.icon;
      const theme = accents[s.accent ?? 'indigo'];

      return (
        <Card
          key={s.label}
          className={cn(
            'group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-slate-200/80 dark:border-slate-800',
            theme.border
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {s.label}
              </span>
              {Icon && (
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
                    theme.bg,
                    theme.text
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {s.value}
              </p>

              {(s.trend || s.subtext) && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {s.trend && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium',
                        s.trend.positive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      )}
                    >
                      {s.trend.positive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{Math.abs(s.trend.value)}%</span>
                    </span>
                  )}
                  {s.subtext && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {s.subtext}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default StatCards;
