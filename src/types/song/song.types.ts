/**
 * Modelo de dados da música (catálogo + músicas do usuário).
 * Campos mínimos: id, title, artist, genre, key, tuning, chords.
 * A cifra completa usa sections/map (estilo MultiTracks).
 */

export interface SongPart {
  chord: string | null;
  text: string;
}

export interface SongLine {
  parts: SongPart[];
}

export type SectionType =
  | 'intro'
  | 'verse'
  | 'prechorus'
  | 'chorus'
  | 'bridge'
  | 'interlude'
  | 'solo'
  | 'ending';

export interface SongSection {
  id: string;
  type: SectionType;
  tag: string;
  name: string;
  annotation?: string;
  lines: SongLine[];
}

export type SongSource = 'demo' | 'harpa' | 'cantor' | 'user';

export interface Song {
  id: string;
  slug: string;
  title: string;
  artist: string;
  /** gênero principal */
  genre: string;
  /** tom (alias de originalKey) */
  key: string;
  /** tom no JSON histórico / motores */
  originalKey: string;
  /** id da afinação (standard, dropD, …) */
  tuning: string;
  /** sequência plana de acordes (formulário / resumo) */
  chords: string[];
  bpm?: number;
  timeSignature: string;
  map: string[];
  sections: SongSection[];
  genres?: string[];
  source: SongSource;
  /** texto original colado (só cifras do usuário) — permite reeditar */
  sourceText?: string;
  /** visível no catálogo público (default true; controlado pelo admin) */
  published?: boolean;
  /** embed YouTube/outros (SPEC_006 C4) — URL de iframe segura https */
  videoUrl?: string;
  /** dificuldade opcional para filtros (A6) */
  difficulty?: 'iniciante' | 'intermediario' | 'avancado';
}

/** Payload do formulário de adição manual */
export interface UserSongInput {
  title: string;
  artist: string;
  genre: string;
  key: string;
  tuning: string;
  /** string "C G Am F" ou uma por linha */
  chordsText: string;
}
