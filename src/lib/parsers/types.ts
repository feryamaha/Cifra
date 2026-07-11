/**
 * Tipos do pipeline de parse de cifras (ChordPro, chord-over-lyrics, upload).
 */

export interface ParsedMeta {
  title?: string;
  artist?: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  tuning?: string;
  genre?: string;
}

export interface ParsedChordToken {
  /** símbolo do acorde, ex: Am7 */
  chord: string;
  /** índice do caractere na linha de letra onde o acorde ancora (0-based) */
  charIndex: number;
}

export interface ParsedLine {
  lyrics: string;
  chords: ParsedChordToken[];
}

export interface ParsedSection {
  id: string;
  type: 'intro' | 'verse' | 'prechorus' | 'chorus' | 'bridge' | 'interlude' | 'solo' | 'ending';
  tag: string;
  name: string;
  lines: ParsedLine[];
}

export interface ParsedChart {
  meta: ParsedMeta;
  sections: ParsedSection[];
  /** todos os acordes na ordem de aparição */
  chords: string[];
  /** formato detectado */
  format: 'chordpro' | 'chord-over-lyrics' | 'chords-only' | 'unknown';
  warnings: string[];
}

export interface SongDraft {
  title: string;
  artist: string;
  genre: string;
  key: string;
  tuning: string;
  bpm?: number;
  timeSignature: string;
  chords: string[];
  /** preview JSON-ready sections for Song */
  sections: {
    id: string;
    type: string;
    tag: string;
    name: string;
    lines: { parts: { chord: string | null; text: string }[] }[];
  }[];
  map: string[];
  sourceFormat: ParsedChart['format'];
  /** texto original colado/extraído — guardado na música para reedição */
  sourceText?: string;
  warnings: string[];
}
