import type { Tuning } from '@/types/music/tunings.types';
import type { Voicing } from '@/types/music/voicing.types';

export interface ChordDiagramProps {
  voicing: Voicing;
  tuning: Tuning;
  label: string;
}
