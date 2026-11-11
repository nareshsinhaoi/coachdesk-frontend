import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export interface CollectionPoint {
  month: string;
  amount: number;
}

interface CollectionChartProps {
  data: CollectionPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const CollectionChart: React.FC<CollectionChartProps> = ({
  data,
  title = 'Fee Collections Overview',
}) => {
  const total = data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total revenue: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Wallet className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-400 text-sm">
            <p>No collection records available</p>
          </div>
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="collectionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#collectionGradient)"
                  dot={{ r: 3, fill: '#4f46e5', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 5, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollectionChart;
