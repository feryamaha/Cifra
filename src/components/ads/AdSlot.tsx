import { cn } from '@/lib/utils';
import type { AdSlotProps } from '@/types/ui/ad-slot.types';

/**
 * Regra de produto NÃO NEGOCIÁVEL: publicidade existe apenas em duas
 * posições, lateral (sidebar) e rodapé (footer). Nunca no header, nunca
 * no topo, nunca entre seções da cifra. Este componente é a ÚNICA porta
 * de entrada de anúncio no site: se um dia alguém tentar renderizar um
 * ad no meio da cifra, terá que passar por aqui e por este comentário.
 */
export function AdSlot({ position, className }: AdSlotProps) {
  return (
    <div
      data-ad-position={position}
      className={cn(
        'flex items-center justify-center rounded-xl border border-dashed border-stroke-200 bg-secondary-900/40 text-xs text-neutral-500',
        position === 'sidebar' ? 'min-h-48' : 'min-h-44 w-full @tablet:min-h-52',
        className,
      )}
    >
      Espaço publicitário ({position === 'sidebar' ? 'lateral' : 'rodapé'})
    </div>
  );
}
