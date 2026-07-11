/**
 * Parser robusto de cifra "acorde em cima da letra" (Cifra Club / BR).
 *
 * Regras-chave:
 * - Linha de acordes NÃO é descarregada em linha em branco
 * - Buffer de acordes só se aplica à próxima linha de letra não vazia
 * - Seções com/sem colchetes (Intro, Refrão, Verso 1, …)
 * - charIndex = coluna na linha de acordes (espaços importam)
 */

import {
  detectSectionType,
  expandTabs,
  isChordToken,
  normalizeChord,
  sanitizeChartText,
  sectionName,
  sectionTag,
  slugifySection,
} from './chord-utils';
import type { ParsedChart, ParsedLine, ParsedMeta, ParsedSection } from './types';

/** Cabeçalho de seção: [Refrão], (Verso 1), Intro:, Refrão 2x, Introdução */
const SECTION_LABEL =
  '(?:intro(?:du[cç][aã]o)?|(?:primeira|segunda|terceira|quarta|quinta|sexta)\\s+parte|verso|verse|estrofe|estrofa|parte|refr[aã]o|chorus|coro|pr[eé][\\s-]?refr[aã]o|pr[eé][\\s-]?chorus|p[oó]s[\\s-]?refr[aã]o|p[oó]s[\\s-]?chorus|ponte|bridge|solo|instrumental|interl[uú]dio|final|outro|ending|coda|riff)';

const HEADER_RE = new RegExp(
  `^\\s*(?:\\[|\\()?\\s*(${SECTION_LABEL}[^\\]\\)]*?)\\s*(?:\\]|\\))?\\s*:?\\s*(?:\\d+x)?\\s*$`,
  'i',
);

/** [Qualquer Nome] no início da linha, com resto opcional (acordes inline). */
const BRACKET_HEADER_RE = /^(\s*[[(]\s*([^\][()]{1,48}?)\s*[\])]\s*:?\s*)(.*)$/;

interface SectionHeader {
  label: string;
  /** linha com o cabeçalho mascarado por espaços, quando o resto são acordes ([Intro] E C#m) */
  chordRest: string | null;
}

/**
 * Cifra Club delimita toda seção com colchetes, com nomes livres
 * ("Primeira Parte", "Pós-Refrão", até com typo). Aceita qualquer rótulo
 * entre colchetes desde que o resto da linha seja vazio, repetição (2x) ou
 * só acordes. Sem colchetes, exige palavra-chave conhecida (HEADER_RE).
 */
export function matchSectionHeader(line: string): SectionHeader | null {
  const m = line.match(BRACKET_HEADER_RE);
  if (m) {
    const label = m[2].trim();
    const rest = m[3].trim();
    // [G]letra colada = ChordPro inline, não é seção
    if (!label || isChordToken(label)) return null;
    if (!rest) return { label, chordRest: null };
    if (isChordLine(rest)) {
      // preserva colunas dos acordes mascarando o cabeçalho
      return { label, chordRest: ' '.repeat(m[1].length) + m[3] };
    }
    // "2x", "x2", "| |" etc. após o nome
    if (/^[\dxX|\s()-]+$/.test(rest)) return { label, chordRest: null };
    return null;
  }
  const t = line.trim();
  if (HEADER_RE.test(t)) {
    const label = t
      .replace(/^[[\s(]+/, '')
      .replace(/[\])\s]+$/, '')
      .replace(/:$/, '')
      .trim();
    return { label, chordRest: null };
  }
  return null;
}

type LineKind = 'empty' | 'section' | 'chords' | 'lyrics' | 'meta';

function classifyLine(line: string): LineKind {
  const trimmed = line.trim();
  if (!trimmed) return 'empty';

  // Tom / Key / Capo / BPM
  if (/^(tom|key|capo|capotraste|bpm|afin[a]?[cç][aã]o)\s*[:-]/i.test(trimmed)) {
    return 'meta';
  }
  // "Tom G" sem dois pontos
  if (/^tom\s+[A-G]/i.test(trimmed) && trimmed.split(/\s+/).length <= 3) {
    return 'meta';
  }

  if (matchSectionHeader(line)) return 'section';

  // Linha que é SÓ o nome de seção sem colchetes e curta
  if (
    new RegExp(`^${SECTION_LABEL}\\s*\\d*\\s*(?:\\d+x)?$`, 'i').test(trimmed) &&
    trimmed.length < 40
  ) {
    return 'section';
  }

  if (isChordLine(line)) return 'chords';
  return 'lyrics';
}

function isChordLine(line: string): boolean {
  const expanded = expandTabs(line);
  const tokens = expanded.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  // remove tokens de repetição "2x" "x2" "|"
  const meaningful = tokens.filter((t) => !/^(\d+x|x\d+|\|+)$/i.test(t));
  if (meaningful.length === 0) return false;

  const chordish = meaningful.filter(isChordToken);
  const ratio = chordish.length / meaningful.length;

  // 1+ acordes e ≥65% dos tokens são acordes
  if (chordish.length >= 1 && ratio >= 0.65) return true;

  // linha curta só com 1–2 acordes (ex: "G  D")
  if (chordish.length === meaningful.length && chordish.length >= 1) return true;

  return false;
}

function extractChordsWithPositions(chordLine: string): { chord: string; charIndex: number }[] {
  const expanded = expandTabs(chordLine);
  const out: { chord: string; charIndex: number }[] = [];
  const re = /\S+/g;
  for (let m = re.exec(expanded); m !== null; m = re.exec(expanded)) {
    const tok = m[0];
    if (/^(\d+x|x\d+|\|+)$/i.test(tok)) continue;
    if (isChordToken(tok)) {
      out.push({ chord: normalizeChord(tok), charIndex: m.index });
    }
  }
  return out;
}

/**
 * Alinha índices de coluna da linha de acordes à linha de letra.
 * Se a letra for mais curta, faz clamp; se sobrar acorde no fim, ancora no último char.
 */
function alignChordsToLyrics(
  chords: { chord: string; charIndex: number }[],
  lyrics: string,
): { chord: string; charIndex: number }[] {
  if (!lyrics) {
    // linha só de acordes: mantém índices relativos
    return chords;
  }
  const max = Math.max(0, lyrics.length - 1);
  // Se a linha de acordes era visualmente mais "larga", escala proporcionalmente
  const maxChordCol = chords.reduce((m, c) => Math.max(m, c.charIndex), 0);
  const scale =
    maxChordCol > 0 && lyrics.length > 0 && maxChordCol > lyrics.length + 4
      ? lyrics.length / (maxChordCol + 1)
      : 1;

  return chords.map((c) => {
    let idx = Math.round(c.charIndex * scale);
    if (idx > max) idx = max;
    if (idx < 0) idx = 0;
    return { chord: c.chord, charIndex: idx };
  });
}

function parseMeta(lines: string[]): { meta: ParsedMeta; skip: Set<number> } {
  const meta: ParsedMeta = {};
  const skip = new Set<number>();

  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const t = lines[i].trim();
    if (!t) continue;

    let m = t.match(/^(?:t[ií]tulo|title)\s*[:-]\s*(.+)$/i);
    if (m) {
      meta.title = m[1].trim();
      skip.add(i);
      continue;
    }
    m = t.match(/^(?:artista|artist|author|banda)\s*[:-]\s*(.+)$/i);
    if (m) {
      meta.artist = m[1].trim();
      skip.add(i);
      continue;
    }
    m = t.match(/^(?:tom|key)\s*[:-]?\s*([A-G](?:#|b)?m?)\b/i);
    if (m) {
      meta.key = m[1];
      skip.add(i);
      continue;
    }
    m = t.match(/^(?:bpm|tempo)\s*[:-]?\s*(\d+)/i);
    if (m) {
      meta.tempo = Number.parseInt(m[1], 10);
      skip.add(i);
    }
  }

  // Heurística: 1ª e 2ª linhas não-vazias/não-acorde/não-seção = título e artista
  // (só se ainda não tiver title)
  if (!meta.title) {
    const candidates: { i: number; t: string }[] = [];
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      if (skip.has(i)) continue;
      const t = lines[i].trim();
      if (!t) continue;
      // linha entre colchetes/parênteses nunca é título ([Primeira Parte], (Intro))
      if (/^[[(]/.test(t)) break;
      if (classifyLine(lines[i]) !== 'lyrics') continue;
      // evita pegar primeira linha de letra real (muito longa)
      if (t.length > 60) break;
      candidates.push({ i, t });
      if (candidates.length >= 2) break;
    }
    if (candidates.length >= 1) {
      meta.title = candidates[0].t;
      skip.add(candidates[0].i);
    }
    if (candidates.length >= 2 && !meta.artist) {
      meta.artist = candidates[1].t;
      skip.add(candidates[1].i);
    }
  }

  return { meta, skip };
}

function guessKeyFromChords(chords: string[]): string | undefined {
  if (chords.length === 0) return undefined;
  // primeiro acorde “forte” (sem /baixo) ou o mais frequente
  const counts = new Map<string, number>();
  for (const c of chords) {
    const root = c.match(/^[A-G](?:#|b)?(?:m)?/)?.[0] ?? c;
    counts.set(root, (counts.get(root) || 0) + 1);
  }
  let best = chords[0].replace(/\/.*/, '');
  let n = 0;
  for (const [k, v] of counts) {
    if (v > n) {
      best = k;
      n = v;
    }
  }
  // tom maior se não for menor explícito no root mais comum
  return best;
}

export function parseChordOverLyrics(text: string): ParsedChart {
  const cleaned = sanitizeChartText(text);
  const rawLines = cleaned.split('\n').map((l) => expandTabs(l));
  const { meta, skip } = parseMeta(rawLines);
  const warnings: string[] = [];
  const sections: ParsedSection[] = [];
  const typeCounts: Record<string, number> = {};

  let currentType: ParsedSection['type'] = 'verse';
  let currentLabel = 'Verso';
  let currentLines: ParsedLine[] = [];
  /** Buffer: só descarrega na próxima linha de LETRA não vazia */
  let pendingChords: { chord: string; charIndex: number }[] | null = null;

  const flushSection = () => {
    // descarta trailing empty lyric lines
    while (
      currentLines.length > 0 &&
      !currentLines[currentLines.length - 1].lyrics &&
      currentLines[currentLines.length - 1].chords.length === 0
    ) {
      currentLines.pop();
    }
    if (currentLines.length === 0) return;
    typeCounts[currentType] = (typeCounts[currentType] || 0) + 1;
    const n = typeCounts[currentType];
    sections.push({
      id: slugifySection(currentLabel, sections.length),
      type: currentType,
      tag: sectionTag(currentType, n),
      name: sectionName(currentType, n, currentLabel),
      lines: currentLines,
    });
    currentLines = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    if (skip.has(i)) continue;
    const line = rawLines[i];
    const kind = classifyLine(line);

    if (kind === 'empty' || kind === 'meta') {
      // NÃO descarrega pendingChords em linha vazia — mantém buffer
      continue;
    }

    if (kind === 'section') {
      const header = matchSectionHeader(line);
      // acordes pendentes antes da seção: vira linha só de acordes
      if (pendingChords?.length) {
        currentLines.push({ lyrics: '', chords: pendingChords });
        pendingChords = null;
      }
      flushSection();
      const label = header?.label ?? line.trim().replace(/^[[\s(]+|[\])\s]+$/g, '');
      currentType = detectSectionType(label);
      currentLabel = label;
      // acordes na mesma linha do cabeçalho ([Intro] E C#m B11 A9)
      if (header?.chordRest) {
        const chords = extractChordsWithPositions(header.chordRest);
        if (chords.length > 0) currentLines.push({ lyrics: '', chords });
      }
      continue;
    }

    if (kind === 'chords') {
      // nova linha de acordes: se já havia buffer sem letra, materializa como só-acordes
      if (pendingChords?.length) {
        currentLines.push({ lyrics: '', chords: pendingChords });
      }
      pendingChords = extractChordsWithPositions(line);
      continue;
    }

    // lyrics
    const lyrics = line; // preserva espaços à esquerda (alinhamento)
    const chords = pendingChords ? alignChordsToLyrics(pendingChords, lyrics.trimEnd()) : [];
    pendingChords = null;
    currentLines.push({ lyrics: lyrics.trimEnd(), chords });
  }

  // acordes no fim do arquivo sem letra
  if (pendingChords?.length) {
    currentLines.push({ lyrics: '', chords: pendingChords });
  }
  flushSection();

  const allChords: string[] = [];
  for (const s of sections) {
    for (const l of s.lines) {
      for (const c of l.chords) allChords.push(c.chord);
    }
  }

  if (allChords.length === 0) {
    warnings.push('Nenhum acorde detectado no texto. Cole uma cifra com acordes (ex: Cifra Club).');
  }
  if (!meta.title) {
    warnings.push('Título não detectado; preencha manualmente.');
  }
  if (!meta.key) {
    meta.key = guessKeyFromChords(allChords);
    if (meta.key) warnings.push(`Tom estimado automaticamente: ${meta.key}`);
  }

  const hasLyrics = sections.some((s) => s.lines.some((l) => l.lyrics.trim().length > 0));

  return {
    meta,
    sections,
    chords: allChords,
    format:
      allChords.length > 0 && hasLyrics
        ? 'chord-over-lyrics'
        : allChords.length > 0
          ? 'chords-only'
          : 'unknown',
    warnings,
  };
}
