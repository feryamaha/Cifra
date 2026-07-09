import { cn } from '@/lib/utils';
import type { CardProps } from '@/types/ui/card.types';

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-stroke-100 bg-secondary-900/70 p-4', className)}>
      {children}
    </div>
  );
}
