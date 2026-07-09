import type { PitchClass } from './notes.types';

export interface Tuning {
  id: string;
  label: string;
  /** pitch classes das cordas soltas, da 6ª para a 1ª */
  strings: PitchClass[];
  /** nomes para exibir no diagrama */
  stringNames: string[];
}
