'use client';

import { cn } from '@/lib/utils';
import type { SelectProps } from '@/types/ui/select.types';

export function Select({ value, options, onChange, label, className }: SelectProps) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full cursor-pointer rounded-md border border-stroke-200 bg-secondary-800 px-3 py-2 font-chakra text-sm text-neutral-900',
        'focus-visible:outline-2 focus-visible:outline-primary-400',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
