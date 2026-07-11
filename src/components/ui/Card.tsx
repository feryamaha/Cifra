import { cn } from '@/lib/utils';
import type { CardProps } from '@/types/ui/card.types';

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'overflow-visible rounded-xl border border-stroke-100 bg-secondary-900/70 p-4 shadow-10',
        'backdrop-blur-[2px] transition-colors duration-normal',
        className,
      )}
    >
      {children}
    </div>
  );
}
