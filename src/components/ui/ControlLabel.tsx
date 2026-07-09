import { cn } from '@/lib/utils';
import type { ControlLabelProps } from '@/types/ui/control-label.types';

export function ControlLabel({ className, children }: ControlLabelProps) {
  return (
    <p
      className={cn(
        'mb-2 font-chakra text-xs font-semibold uppercase tracking-wider text-neutral-500',
        className,
      )}
    >
      {children}
    </p>
  );
}
