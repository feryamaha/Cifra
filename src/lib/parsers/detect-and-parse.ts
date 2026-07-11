/**
 * Detecta formato e parseia texto de cifra.
 */

import { parseChordOverLyrics } from './chord-over-lyrics';
import { parseChordPro } from './chordpro';
import { chartToSongDraft } from './to-song-draft';
import type { ParsedChart, SongDraft } from './types';

export function looksLikeChordPro(text: string): boolean {
  return (
    /\{\s*(title|t|artist|a|key|k|start_of_)/i.test(text) ||
    (/\[[A-G]/.test(text) && /\{/.test(text))
  );
}

export function parseChartText(text: string): ParsedChart {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      meta: {},
      sections: [],
      chords: [],
      format: 'unknown',
      warnings: ['Texto vazio.'],
    };
  }
  if (looksLikeChordPro(trimmed)) {
    return parseChordPro(trimmed);
  }
  return parseChordOverLyrics(trimmed);
}

export function parseChartToDraft(text: string, overrides?: Partial<SongDraft>): SongDraft {
  const chart = parseChartText(text);
  const draft = chartToSongDraft(chart, overrides);
  draft.sourceText = text;
  return draft;
}
