import { cn } from '@/lib/utils';
import type { BadgeProps, BadgeVariant } from '@/types/ui/badge.types';

const VARIANTS: Record<BadgeVariant, string> = {
  amber: 'bg-primary-950 text-primary-300 border-primary-800',
  success:
    'bg-auxiliary-success-background text-auxiliary-success-default border-auxiliary-success-border',
  danger:
    'bg-auxiliary-danger-background text-auxiliary-danger-default border-auxiliary-danger-border',
  warning:
    'bg-auxiliary-warning-background text-auxiliary-warning-default border-auxiliary-warning-border',
  info: 'bg-auxiliary-info-background text-auxiliary-info-default border-auxiliary-info-border',
  neutral: 'bg-secondary-800 text-neutral-700 border-stroke-200',
  number:
    'min-w-[18px] h-[18px] px-[3px] rounded-full bg-white text-[10px] text-black border border-stroke-200',
};

export function Badge({ variant = 'neutral', disabled = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full border font-mono text-xs',
        !disabled && 'shadow-10',
        VARIANTS[variant],
        variant !== 'number' && 'px-2.5 py-0.5',
        disabled && 'grayscale opacity-60',
        className,
      )}
    >
      {children}
    </span>
  );
}
