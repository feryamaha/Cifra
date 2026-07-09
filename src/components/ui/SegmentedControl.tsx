'use client';

import { cn } from '@/lib/utils';
import type { SegmentedControlProps } from '@/types/ui/segmented-control.types';

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-lg border border-stroke-200 bg-secondary-900 p-1',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'cursor-pointer rounded-md font-chakra transition-colors duration-150',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            'focus-visible:outline-2 focus-visible:outline-primary-400',
            value === opt.value
              ? 'bg-primary-400 font-semibold text-secondary-950'
              : 'text-neutral-700 hover:bg-secondary-800 hover:text-neutral-900',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
