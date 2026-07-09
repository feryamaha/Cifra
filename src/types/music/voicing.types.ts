import type { PitchClass } from './notes.types';

export interface Voicing {
  /** traste por corda (da 6ª à 1ª); 0 = solta; null = não toca */
  frets: (number | null)[];
  score: number;
}

export interface VoicingTarget {
  pcs: PitchClass[];
  required: PitchClass[];
  bassPc: PitchClass;
}
