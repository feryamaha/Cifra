'use client';

import { cn } from '@/lib/utils';
import type { StepperProps } from '@/types/ui/stepper.types';

export function Stepper({ value, onChange, min, max, format, label, className }: StepperProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-stroke-200 bg-secondary-900',
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Diminuir ${label ?? ''}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="cursor-pointer px-3 py-1.5 font-chakra text-lg text-primary-300 disabled:cursor-not-allowed disabled:text-neutral-500"
      >
        -
      </button>
      <span className="min-w-14 text-center font-mono text-sm text-neutral-900">
        {format ? format(value) : value}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${label ?? ''}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="cursor-pointer px-3 py-1.5 font-chakra text-lg text-primary-300 disabled:cursor-not-allowed disabled:text-neutral-500"
      >
        +
      </button>
    </div>
  );
}
