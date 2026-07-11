import type { Tuning } from '@/types/music/tunings.types';
import type { Voicing } from '@/types/music/voicing.types';

export type ChordDiagramSize = 'sm' | 'md' | 'lg';

export interface ChordDiagramProps {
  voicing: Voicing;
  tuning: Tuning;
  label: string;
  /** sm = hover popover, md = painel, lg = destaque */
  size?: ChordDiagramSize;
  /** mostrar números dos dedos nas bolinhas */
  showFingers?: boolean;
  className?: string;
}
