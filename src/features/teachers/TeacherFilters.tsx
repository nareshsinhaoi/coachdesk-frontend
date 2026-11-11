import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

export interface TeacherFiltersValue {
  search: string;
  status: string;
  subject: string;
}

interface TeacherFiltersProps {
  value: TeacherFiltersValue;
  onChange: (v: TeacherFiltersValue) => void;
  subjects?: string[];
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({ value, onChange, subjects = [] }) => {
  const hasActiveFilters = Boolean(value.search || value.status || value.subject);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by name, email, phone or subject…"
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
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>

      {/* Subject Filter */}
      {subjects.length > 0 && (
        <Select
          className="sm:w-48"
          value={value.subject}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      )}

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ search: '', status: '', subject: '' })}
          className="gap-1.5 text-slate-500 hover:text-slate-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
};

export default TeacherFilters;

