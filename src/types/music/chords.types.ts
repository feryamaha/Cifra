import type { PitchClass } from './notes.types';

export interface ParsedChord {
  /** símbolo original completo, ex: "F#m7(11)/A" */
  symbol: string;
  /** raiz, ex: "F#" */
  root: string;
  rootPc: PitchClass;
  /** sufixo exato, ex: "m7(11)" */
  suffix: string;
  /** baixo da inversão, ex: "A" (opcional) */
  bass: string | null;
  bassPc: PitchClass | null;
}

export interface ChordIntervals {
  /** intervalos relativos à raiz, em semitons (mod 12), ex: [0,4,7,11] */
  intervals: number[];
  /** subconjunto que o shape precisa cobrir obrigatoriamente */
  required: number[];
}

/** Pitch classes absolutas do acorde (entrada do motor de shapes). */
export interface ChordPitchClasses {
  pcs: PitchClass[];
  required: PitchClass[];
  bassPc: PitchClass;
}
