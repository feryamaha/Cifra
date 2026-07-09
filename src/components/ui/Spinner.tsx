import { cn } from '@/lib/utils';
import type { SpinnerProps } from '@/types/ui/spinner.types';

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const;

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'inline-block animate-spin rounded-full border-primary-400 border-t-transparent',
        SIZE_CLASSES[size],
        className,
      )}
    />
  );
}
