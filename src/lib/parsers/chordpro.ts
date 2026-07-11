/**
 * Parser ChordPro → ParsedChart
 * Suporta: {title:}, {artist:}, {key:}, {tempo:}, {time:}, {start_of_*} / {end_of_*},
 * [Am]letra com acordes inline.
 */

import {
  detectSectionType,
  normalizeChord,
  sectionName,
  sectionTag,
  slugifySection,
} from './chord-utils';
import type { ParsedChart, ParsedLine, ParsedMeta, ParsedSection } from './types';

const META_RE = /^\{\s*([^:}]+)\s*:\s*(.*?)\s*\}$/;
const ENV_START_RE = /^\{\s*start_of_([a-z_]+)\s*(?::\s*(.*?))?\s*\}$/i;
const ENV_END_RE = /^\{\s*end_of_([a-z_]+)\s*\}$/i;
const CHORD_INLINE_RE = /\[([^\]]+)\]/g;

function parseMetaKey(k: string): keyof ParsedMeta | null {
  const key = k.toLowerCase().trim();
  if (key === 'title' || key === 't') return 'title';
  if (key === 'artist' || key === 'a' || key === 'subtitle' || key === 'st') return 'artist';
  if (key === 'key' || key === 'k') return 'key';
  if (key === 'tempo' || key === 'bpm') return 'tempo';
  if (key === 'time' || key === 'time_signature') return 'timeSignature';
  if (key === 'tuning') return 'tuning';
  if (key === 'genre') return 'genre';
  return null;
}

/** Extrai acordes e letra de uma linha ChordPro com [C]texto */
export function parseChordProLine(raw: string): ParsedLine {
  const chords: ParsedLine['chords'] = [];
  let lyrics = '';
  const i = 0;
  const re = new RegExp(CHORD_INLINE_RE.source, 'g');
  let last = 0;
  for (let m = re.exec(raw); m !== null; m = re.exec(raw)) {
    lyrics += raw.slice(last, m.index);
    const chord = normalizeChord(m[1]);
    chords.push({ chord, charIndex: lyrics.length });
    last = m.index + m[0].length;
  }
  lyrics += raw.slice(last);
  // limpa espaços só de chord-only lines? keep as is
  void i;
  return { lyrics, chords };
}

export function parseChordPro(text: string): ParsedChart {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const meta: ParsedMeta = {};
  const warnings: string[] = [];
  const sections: ParsedSection[] = [];
  const typeCounts: Record<string, number> = {};

  let currentType: ParsedSection['type'] = 'verse';
  let currentName = 'Verso';
  let currentLines: ParsedLine[] = [];
  let inEnv = false;

  const flush = () => {
    if (currentLines.length === 0) return;
    const t = currentType;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
    const n = typeCounts[t];
    const id = slugifySection(currentName, sections.length);
    sections.push({
      id,
      type: t,
      tag: sectionTag(t, n),
      name: currentName.includes(' ') ? currentName : sectionName(t, n),
      lines: currentLines,
    });
    currentLines = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentLines.length > 0) currentLines.push({ lyrics: '', chords: [] });
      continue;
    }

    // environments
    const envStart = trimmed.match(ENV_START_RE);
    if (envStart) {
      flush();
      const label = envStart[2]?.trim() || envStart[1];
      currentType = detectSectionType(envStart[1]);
      currentName = label;
      inEnv = true;
      continue;
    }
    if (ENV_END_RE.test(trimmed)) {
      flush();
      inEnv = false;
      currentType = 'verse';
      currentName = 'Verso';
      continue;
    }

    // meta
    const metaM = trimmed.match(META_RE);
    if (metaM) {
      const field = parseMetaKey(metaM[1]);
      const val = metaM[2].trim();
      if (field === 'tempo') {
        const n = Number.parseInt(val, 10);
        if (!Number.isNaN(n)) meta.tempo = n;
      } else if (field) {
        (meta as Record<string, string>)[field] = val;
      }
      continue;
    }

    // comment {c: } or #
    if (trimmed.startsWith('#') || /^\{\s*c(omment)?\s*:/i.test(trimmed)) {
      continue;
    }

    // section hint as {comment} already skipped; bare [Verse] style not standard

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      // ignore other directives
      continue;
    }

    currentLines.push(parseChordProLine(line));
  }
  flush();

  if (!inEnv && sections.length === 0) {
    warnings.push('Nenhuma seção com conteúdo encontrada.');
  }

  const chords: string[] = [];
  for (const s of sections) {
    for (const l of s.lines) {
      for (const c of l.chords) chords.push(c.chord);
    }
  }

  if (chords.length === 0) {
    warnings.push('Nenhum acorde [C] encontrado no texto ChordPro.');
  }

  return {
    meta,
    sections,
    chords,
    format: 'chordpro',
    warnings,
  };
}
