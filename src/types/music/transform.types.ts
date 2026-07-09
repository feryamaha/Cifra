import type { ParsedChord } from './chords.types';

export type AccidentalStyle = 'flat' | 'sharp';

export type NotationMode = 'letters' | 'numbers';

export interface ViewOptions {
  /** deslocamento de tom escolhido pelo usuário, em semitons */
  transpose: number;
  /** traste do capotraste (0 = sem capo) */
  capo: number;
  notation: NotationMode;
  simplified: boolean;
  accidentalStyle: AccidentalStyle;
}

export interface RenderedChord {
  /** o que aparece impresso na cifra */
  display: string;
  /** o acorde que SOA (tom atual da música) */
  sounding: ParsedChord;
  /** o SHAPE que a mão faz (sounding transposto -capo) */
  shape: ParsedChord;
}
