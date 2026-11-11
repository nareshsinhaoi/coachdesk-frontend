import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = '₹'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return currency + (isNaN(n) ? '0' : n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(date: string | Date): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
}