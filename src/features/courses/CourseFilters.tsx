import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface CourseFiltersValue {
  search: string;
  status: string;
}

interface CourseFiltersProps {
  value: CourseFiltersValue;
  onChange: (value: CourseFiltersValue) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ value, onChange }) => {
  const hasActiveFilters = Boolean(value.search || value.status);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by course name or code..."
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
        />
      </div>
      <Select
        className="sm:w-40"
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value })}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ search: '', status: '' })}
          className="gap-1.5 text-slate-500 hover:text-slate-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
};

export default CourseFilters;
