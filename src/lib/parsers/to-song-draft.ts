/**
 * Converte ParsedChart → SongDraft.
 * Ancora acordes no texto preservando espaços para o preview monoespaçado.
 */

import type { ParsedChart, ParsedLine, SongDraft } from './types';

/**
 * Converte linha (lyrics + chords com charIndex) em parts {chord, text}.
 * Os índices são colunas na string de letra (após alinhamento).
 */
export function lineToParts(line: ParsedLine): { chord: string | null; text: string }[] {
  const lyrics = line.lyrics ?? '';
  const chords = [...(line.chords ?? [])].sort((a, b) => a.charIndex - b.charIndex);

  if (chords.length === 0) {
    return [{ chord: null, text: lyrics }];
  }

  // Só acordes, sem letra
  if (!lyrics.trim()) {
    return chords.map((c) => ({ chord: c.chord, text: '        ' }));
  }

  const parts: { chord: string | null; text: string }[] = [];
  let cursor = 0;

  for (let i = 0; i < chords.length; i++) {
    const c = chords[i];
    const next = chords[i + 1];
    let start = Math.min(Math.max(0, c.charIndex), lyrics.length);

    // não voltar atrás se índices se sobrepõem
    if (start < cursor) start = cursor;

    if (start > cursor) {
      parts.push({ chord: null, text: lyrics.slice(cursor, start) });
    }

    let end = next ? Math.min(Math.max(next.charIndex, start), lyrics.length) : lyrics.length;

    // garante pelo menos 1 char de texto sob o acorde quando há letra restante
    if (end <= start && start < lyrics.length) {
      end = start + 1;
    }

    const slice = lyrics.slice(start, end);
    parts.push({
      chord: c.chord,
      text: slice.length > 0 ? slice : ' ',
    });
    cursor = Math.max(end, start);
  }

  if (cursor < lyrics.length) {
    parts.push({ chord: null, text: lyrics.slice(cursor) });
  }

  // se só geramos partes vazias com chord, ok
  if (parts.length === 0) {
    return chords.map((c) => ({ chord: c.chord, text: ' ' }));
  }

  return parts;
}

export function chartToSongDraft(chart: ParsedChart, overrides?: Partial<SongDraft>): SongDraft {
  const sections = chart.sections.map((s) => ({
    id: s.id,
    type: s.type,
    tag: s.tag,
    name: s.name,
    lines: s.lines
      .filter((l) => l.lyrics.length > 0 || l.chords.length > 0)
      .map((l) => ({ parts: lineToParts(l) })),
  }));

  const map = sections.map((s) => s.id);
  const chords =
    chart.chords.length > 0
      ? chart.chords
      : sections.flatMap((s) =>
          s.lines.flatMap((l) =>
            l.parts.map((p) => p.chord).filter((c): c is string => Boolean(c)),
          ),
        );

  return {
    title: overrides?.title || chart.meta.title || '',
    artist: overrides?.artist || chart.meta.artist || '',
    genre: overrides?.genre || chart.meta.genre || 'Cifras',
    key: overrides?.key || chart.meta.key || 'C',
    tuning: overrides?.tuning || chart.meta.tuning || 'standard',
    bpm: overrides?.bpm ?? chart.meta.tempo,
    timeSignature: overrides?.timeSignature || chart.meta.timeSignature || '4/4',
    chords,
    sections,
    map,
    sourceFormat: chart.format,
    warnings: chart.warnings,
  };
}

export function hasChords(draft: SongDraft): boolean {
  return draft.chords.length > 0;
}
