'use client';

import { cn } from '@/lib/utils';
import type { ToggleProps } from '@/types/ui/toggle.types';

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-primary-400 focus-visible:outline-offset-2',
        checked ? 'border-primary-500 bg-primary-500' : 'border-stroke-200 bg-secondary-700',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-neutral-900 transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
}
