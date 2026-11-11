import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

export interface StudentFiltersValue {
  search: string;
  status: string;
  batchId: string;
}

interface StudentFiltersProps {
  value: StudentFiltersValue;
  onChange: (v: StudentFiltersValue) => void;
  batches?: { id: string; name: string }[];
}

const StudentFilters: React.FC<StudentFiltersProps> = ({ value, onChange, batches = [] }) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="pl-9"
        placeholder="Search by name, roll no, phone…"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
    </div>
    <Select
      className="sm:w-40"
      value={value.status}
      onChange={(e) => onChange({ ...value, status: e.target.value })}
    >
      <option value="">All statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="alumni">Alumni</option>
    </Select>
    <Select
      className="sm:w-48"
      value={value.batchId}
      onChange={(e) => onChange({ ...value, batchId: e.target.value })}
    >
      <option value="">All batches</option>
      {batches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </Select>
    <Button
      variant="outline"
      onClick={() => onChange({ search: '', status: '', batchId: '' })}
      title="Reset filters"
    >
      <RotateCcw className="h-4 w-4" /> Reset
    </Button>
  </div>
);

export default StudentFilters;