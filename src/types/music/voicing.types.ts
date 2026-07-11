import type { PitchClass } from './notes.types';

export interface Voicing {
  /** traste por corda (da 6ª à 1ª); 0 = solta; null = não toca */
  frets: (number | null)[];
  /** dedo 1–4 por corda; 0 = solta; null = muda / sem dedo */
  fingers: (number | null)[];
  /** traste da pestana, se o shape usa barre */
  barre: number | null;
  score: number;
}

export interface VoicingTarget {
  pcs: PitchClass[];
  required: PitchClass[];
  bassPc: PitchClass;
}
