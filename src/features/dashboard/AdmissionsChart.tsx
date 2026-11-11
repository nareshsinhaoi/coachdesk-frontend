import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export interface AdmissionPoint {
  month: string;
  count: number;
}

interface AdmissionsChartProps {
  data: AdmissionPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base font-bold text-sky-600 dark:text-sky-400">
          {payload[0].value} {payload[0].value === 1 ? 'Student' : 'Students'}
        </p>
      </div>
    );
  }
  return null;
};

const AdmissionsChart: React.FC<AdmissionsChartProps> = ({
  data,
  title = 'Student Admissions Trend',
}) => {
  const total = data.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

  return (
    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total admissions: <span className="font-semibold text-slate-700 dark:text-slate-300">{total} students</span>
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
          <UserPlus className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-400 text-sm">
            <p>No admission records available</p>
          </div>
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdmissionsChart;
