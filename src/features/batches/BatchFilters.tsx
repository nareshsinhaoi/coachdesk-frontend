import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

export interface BatchFiltersValue {
  search: string;
  status: string;
  course: string;
}

interface BatchFiltersProps {
  value: BatchFiltersValue;
  onChange: (v: BatchFiltersValue) => void;
  courses?: string[];
}

const BatchFilters: React.FC<BatchFiltersProps> = ({ value, onChange, courses = [] }) => {
  const hasActiveFilters = Boolean(value.search || value.status || value.course);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by batch name, code, course…"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>

      {/* Status Filter */}
      <Select
        className="sm:w-40"
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value })}
      >
        <option value="">All statuses</option>
        <option value="running">Running</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>

      {/* Course Filter */}
      {courses.length > 0 && (
        <Select
          className="sm:w-48"
          value={value.course}
          onChange={(e) => onChange({ ...value, course: e.target.value })}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      )}

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ search: '', status: '', course: '' })}
          className="gap-1.5 text-slate-500 hover:text-slate-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
};

export default BatchFilters;

