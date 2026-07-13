/**
 * song-view.helpers.ts
 * Funções PURAS que derivam o modelo da tela de cifra a partir do JSON
 * da música + opções de visualização. O estado fica no hook
 * (useSongView.hook.ts); os componentes só renderizam o resultado.
 */

import { chordPitchClasses } from '@/lib/music/chords';
import { keyPrefersFlats, mod12, nameToPc, pcToName } from '@/lib/music/notes';
import { renderChord } from '@/lib/music/transform';
import { findVoicing, findVoicings } from '@/lib/music/voicing';
import type { PitchClass } from '@/types/music/notes.types';
import type { ViewOptions } from '@/types/music/transform.types';
import type { Tuning } from '@/types/music/tunings.types';
import type { Song, SongSection } from '@/types/song/song.types';
import type {
  ChordSequence,
  RenderedSection,
  ScaleDegreeBadge,
  SelectedVoicing,
} from '@/types/song/song-view.types';

/** Nome do tom com a ortografia correta da armadura (F# vs Gb). */
export function keyNameOf(pc: PitchClass): string {
  return pcToName(pc, keyPrefersFlats(pc));
}

/**
 * Aplica o pipeline transpose -> simplify -> capo -> notação em todas as
 * seções. O JSON guarda os acordes no TOM ORIGINAL e nada é mutado:
 * o resultado é 100% derivado a cada mudança de opção.
 */
export function buildRenderedSections(
  song: Song,
  originalKeyPc: PitchClass,
  opts: ViewOptions,
): RenderedSection[] {
  return song.sections.map((section) => ({
    id: section.id,
    tag: section.tag,
    name: section.name,
    annotation: section.annotation,
    lines: section.lines.map((line) => ({
      parts: line.parts.map((part) => {
        const rendered = part.chord ? renderChord(part.chord, originalKeyPc, opts) : null;
        return {
          chord: part.chord,
          display: rendered ? rendered.display : null,
          text: part.text,
        };
      }),
    })),
  }));
}

/** Seções na ordem de execução do mapa (repetições incluídas). */
export function buildMapSections(song: Song): SongSection[] {
  const byId = new Map(song.sections.map((s) => [s.id, s]));
  return song.map.map((id) => byId.get(id)).filter((s): s is SongSection => s !== undefined);
}

/**
 * Diagrama do acorde selecionado, calculado para a afinação atual.
 * O shape considera capo e simplificação (é o desenho que a mão faz).
 */
export function resolveSelectedVoicing(
  selectedChord: string | null,
  originalKeyPc: PitchClass,
  opts: ViewOptions,
  tuning: Tuning,
): SelectedVoicing | null {
  if (!selectedChord) return null;
  const rendered = renderChord(selectedChord, originalKeyPc, opts);
  if (!rendered) return null;
  const target = chordPitchClasses(rendered.shape);
  const voicing = findVoicing(tuning.strings, target);
  return voicing ? { voicing, label: rendered.shape.symbol } : null;
}

/** Melhor shape + variações alternativas (para hover com múltiplos diagramas). */
export function resolveChordVoicings(
  originalSymbol: string,
  originalKeyPc: PitchClass,
  opts: ViewOptions,
  tuning: Tuning,
  limit = 3,
): { label: string; voicings: import('@/types/music/voicing.types').Voicing[] } | null {
  const rendered = renderChord(originalSymbol, originalKeyPc, opts);
  if (!rendered) return null;
  const target = chordPitchClasses(rendered.shape);
  const voicings = findVoicings(tuning.strings, target, limit);
  if (voicings.length === 0) return null;
  return { label: rendered.shape.symbol, voicings };
}

/**
 * Converte a escolha de um tom-alvo (botões C..B) no menor deslocamento
 * em semitons a partir do tom original (ex: prefere -3 a +9).
 */
export function transposeForKeyRoot(root: string, originalKeyPc: PitchClass): number | null {
  const pc = nameToPc(root);
  if (pc === null) return null;
  const delta = mod12(pc - originalKeyPc);
  return delta > 6 ? delta - 12 : delta;
}

/** Grau fixo da nota (C=1, D=2... B=7), usado como referência visual. */
export function degreeOfNote(noteName: string): string {
  const DEGREES: Record<string, string> = {
    C: '1',
    D: '2',
    E: '3',
    F: '4',
    G: '5',
    A: '6',
    B: '7',
  };
  return DEGREES[noteName] ?? '?';
}

/** Retorna graus fixos para todos os botões de tom. */
export function buildScaleDegreeBadges(): ScaleDegreeBadge[] {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return notes.map((note) => ({ note, degree: degreeOfNote(note) }));
}

/**
 * Núcleo harmônico do acorde para COMPARAR progressões (regra do Fernando,
 * músico multi-instrumentista): a extensão (7, 9, 11, 4, sus, add, 6...) e o
 * baixo invertido (/X) são arranjo/dedilhado, não mudam o lugar do acorde na
 * progressão. Preserva apenas a QUALIDADE da tríade que muda o som: menor (m),
 * diminuto (dim/°) e aumentado (aug/+).
 *
 *   B11 → B · A/E → A · E4 → E · Bm7 → Bm · C#m7(9) → C#m · Am → Am · G#dim → G#dim
 *
 * Assim "E C#m B11 A9" e "E C#m B A9" contam como a MESMA progressão, mas o
 * final dissonante "E Bm A Am" é DIFERENTE do refrão "E B A9 C#m B" (Bm ≠ B).
 */
/** Exportado para testes (SPEC_013). */
export function chordCore(chord: string): string {
  const base = chord.replace(/\/.*$/, '').trim();
  const rootMatch = base.match(/^[A-G](?:#|b)?/);
  if (!rootMatch) return base;
  const root = rootMatch[0];
  const rest = base.slice(root.length);
  if (/^(dim|°|º)/i.test(rest)) return `${root}dim`;
  if (/^(aug|\+)/.test(rest)) return `${root}aug`;
  if (/^m(?!aj)/.test(rest)) return `${root}m`;
  return root;
}

/**
 * Menor ciclo harmônico de uma frase: o menor período p tal que a sequência
 * de núcleos seja a repetição do primeiro bloco de p acordes. Exige EVIDÊNCIA
 * (n ≥ 2p): uma frase tocada só uma vez (sem repetir dentro dela) devolve ela
 * inteira, não um pedaço. Isso preserva a ponte "E B A E E4" (5 acordes) que
 * não se repete internamente, e comprime "E C#m B A E C#m B A" para "E C#m B A".
 */
function minimalCycle(cores: string[]): number {
  const n = cores.length;
  for (let p = 1; p * 2 <= n; p++) {
    let ok = true;
    for (let k = p; k < n; k++) {
      if (cores[k] !== cores[k - p]) {
        ok = false;
        break;
      }
    }
    if (ok) return p;
  }
  return n;
}

/** Sequência bruta de acordes de uma seção (sem repetições consecutivas). */
function sectionChordRun(section: SongSection): string[] {
  const chords: string[] = [];
  for (const line of section.lines) {
    for (const part of line.parts) {
      const chord = part.chord;
      if (!chord) continue;
      const last = chords[chords.length - 1];
      // Normaliza acordes com inversão para comparação (G/B -> G)
      const normalized = chord.replace(/\/.*$/, '');
      const lastNormalized = last ? last.replace(/\/.*$/, '') : null;
      if (normalized === lastNormalized) continue;
      chords.push(chord);
    }
  }
  return chords;
}

/** Acordes únicos na ordem de primeira aparição. */
export function collectUniqueChords(song: Song): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const section of song.sections) {
    for (const line of section.lines) {
      for (const part of line.parts) {
        if (!part.chord || seen.has(part.chord)) continue;
        seen.add(part.chord);
        list.push(part.chord);
      }
    }
  }
  return list;
}

/** Comprimento máx. de uma progressão candidata (frases longas de popular/gospel). */
const MAX_CYCLE_LEN = 12;

/** True se o ciclo `cyc` casa exatamente começando na posição `at` de `cores`. */
function cycleMatchesAt(cores: string[], at: number, cyc: string[]): boolean {
  if (at + cyc.length > cores.length) return false;
  for (let j = 0; j < cyc.length; j++) if (cores[at + j] !== cyc[j]) return false;
  return true;
}

/**
 * Conta ocorrências não-sobrepostas (greedy L→R).
 * É a frequência ×N que o painel mostra: quantas vezes a progressão é TOCADA.
 */
function countOccurrences(fullCores: string[], cycleCores: string[]): number {
  const p = cycleCores.length;
  if (p === 0) return 0;
  let count = 0;
  let i = 0;
  while (i + p <= fullCores.length) {
    if (cycleMatchesAt(fullCores, i, cycleCores)) {
      count++;
      i += p;
    } else {
      i += 1;
    }
  }
  return count;
}

function firstOccurrence(fullCores: string[], cycleCores: string[]): number {
  const p = cycleCores.length;
  for (let i = 0; i + p <= fullCores.length; i++) {
    if (cycleMatchesAt(fullCores, i, cycleCores)) return i;
  }
  return -1;
}

function isContiguousSubarray(longC: string[], shortC: string[]): boolean {
  if (shortC.length >= longC.length) return false;
  const needle = shortC.join('|');
  for (let i = 0; i + shortC.length <= longC.length; i++) {
    if (longC.slice(i, i + shortC.length).join('|') === needle) return true;
  }
  return false;
}

/**
 * Vamp real de 2 acordes: 3 repetições consecutivas (A B A B A B).
 * Distingue vamp verdadeiro de coincidência de fronteira (...A B | A B...).
 */
function hasTripleVamp(fullCores: string[], cycle: string[]): boolean {
  if (cycle.length !== 2) return true;
  const p = 2;
  for (let s = 0; s + 3 * p <= fullCores.length; s++) {
    if (
      cycleMatchesAt(fullCores, s, cycle) &&
      cycleMatchesAt(fullCores, s + p, cycle) &&
      cycleMatchesAt(fullCores, s + 2 * p, cycle)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Densidade de cobertura: (ocorrências × comprimento) / N.
 * Proxy estatístico de “quão central” é a progressão (refrão costuma cobrir mais).
 */
function coverageRatio(occ: number, len: number, n: number): number {
  if (n <= 0) return 0;
  return (occ * len) / n;
}

/**
 * Progressões da forma (SPEC_014 / ISSUE_007).
 *
 * 1) Candidatos = frases do chart (cada seção) + lag tandem (vamps ≥3 períodos).
 * 2) Contagem ×N global (map). SSM: igualdade de núcleos.
 * 3) ×≥2: progressões que se repetem; ×=1: só se for frase de seção do chart (solo/final).
 * 4) Anti-fronteira em padrões de 2 acordes (vamp ou ×≥4).
 * 5) Rótulo = 1ª escrita; ordem = 1ª aparição.
 * UNIVERSAL: zero hardcode de obra. Manuais em song.progressions vencem.
 */
function detectProgressionsFromSong(
  song: Song,
  cores: string[],
  display: string[],
): ChordSequence[] {
  const n = cores.length;
  if (n < 2) return [];

  type Cand = { cycle: string[]; firstStart: number; fromSection: boolean };
  const byKey = new Map<string, Cand>();

  const registerPattern = (cycle: string[], evidenceStart: number, fromSection: boolean) => {
    if (cycle.length < 2 || cycle.length > MAX_CYCLE_LEN) return;
    if (cycle.every((c) => c === cycle[0])) return;
    const p = minimalCycle(cycle);
    if (p < 2) return;
    const unit = cycle.slice(0, p);
    if (unit.every((c) => c === unit[0])) return;
    const key = unit.join('|');
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, { cycle: unit, firstStart: evidenceStart, fromSection });
      return;
    }
    byKey.set(key, {
      cycle: unit,
      firstStart: Math.min(prev.firstStart, evidenceStart),
      fromSection: prev.fromSection || fromSection,
    });
  };

  // Fase 1: frases do chart (unidades da forma — solo/final entram mesmo com ×1)
  for (const section of song.sections) {
    const run = sectionChordRun(section);
    if (run.length < 2) continue;
    let secCores = run.map(chordCore);
    if (secCores.length >= 4) {
      const p = minimalCycle(secCores);
      if (p >= 2 && p < secCores.length && secCores.length % p === 0) {
        secCores = secCores.slice(0, p);
      }
    }
    if (secCores.length < 2 || secCores.length > MAX_CYCLE_LEN) continue;
    const first = firstOccurrence(cores, secCores);
    if (first >= 0) registerPattern(secCores, first, true);
  }

  // Fase 2: lag tandem ≥3 períodos (vamps) — não cola intro+refrão com só 2 cópias
  for (let L = 2; L <= Math.min(MAX_CYCLE_LEN, Math.floor(n / 3)); L++) {
    let i = 0;
    while (i + 3 * L <= n) {
      const unit = cores.slice(i, i + L);
      if (cycleMatchesAt(cores, i + L, unit) && cycleMatchesAt(cores, i + 2 * L, unit)) {
        registerPattern(unit, i, false);
        let j = i + 3 * L;
        while (j + L <= n && cycleMatchesAt(cores, j, unit)) j += L;
        i = Math.max(i + 1, j - L);
      } else {
        i += 1;
      }
    }
  }

  type Scored = {
    key: string;
    cycle: string[];
    display: string[];
    occ: number;
    first: number;
    coverage: number;
  };
  const scored: Scored[] = [];

  for (const [key, cand] of byKey) {
    const occ = Math.max(1, countOccurrences(cores, cand.cycle));
    const len = cand.cycle.length;
    // ×1 só se veio de seção do chart (SPEC_014 C7)
    if (occ === 1 && !cand.fromSection) continue;
    if (occ >= 2 && len === 2 && !hasTripleVamp(cores, cand.cycle) && occ < 4) continue;
    // ×1 com só 2 acordes: arriscado (fronteira); exige seção e não é só lag
    if (occ === 1 && len === 2) continue;

    const first = firstOccurrence(cores, cand.cycle);
    if (first < 0) continue;

    scored.push({
      key,
      cycle: cand.cycle,
      display: display.slice(first, first + len),
      occ,
      first,
      coverage: coverageRatio(occ, len, n),
    });
  }

  scored.sort(
    (a, b) => b.cycle.length - a.cycle.length || b.coverage - a.coverage || a.first - b.first,
  );

  const kept: Scored[] = [];
  for (const s of scored) {
    const dominated = kept.some((k) => {
      if (!isContiguousSubarray(k.cycle, s.cycle)) return false;
      return k.occ >= s.occ;
    });
    if (dominated) continue;
    const rotationOfKept = kept.some((k) => {
      if (k.cycle.length !== s.cycle.length) return false;
      const kk = `${k.cycle.join('|')}|${k.cycle.join('|')}`;
      return kk.includes(s.cycle.join('|'));
    });
    if (rotationOfKept) continue;
    kept.push(s);
  }

  // Fase 4 (SPEC_014 C7): frases de seção do chart entram mesmo com ×1
  // (solo/final), e mesmo se o núcleo for subpadrão de outra progressão.
  const playOrder = song.map && song.map.length > 0 ? song.map : song.sections.map((s) => s.id);
  const byId = new Map(song.sections.map((s) => [s.id, s]));
  const sectionFirstIdx = new Map<string, number>();
  let walk = 0;
  for (const id of playOrder) {
    const sec = byId.get(id);
    if (!sec) continue;
    const runLen = sectionChordRun(sec).length;
    if (!sectionFirstIdx.has(id)) sectionFirstIdx.set(id, walk);
    walk += runLen;
  }

  const exactKeys = new Set(kept.map((k) => k.key));
  for (const section of song.sections) {
    const run = sectionChordRun(section);
    if (run.length < 2 || run.length > MAX_CYCLE_LEN) continue;
    let secCores = run.map(chordCore);
    if (secCores.length >= 4) {
      const p = minimalCycle(secCores);
      if (p >= 2 && p < secCores.length && secCores.length % p === 0) {
        secCores = secCores.slice(0, p);
      }
    }
    if (secCores.length < 2) continue;
    const key = secCores.join('|');
    if (exactKeys.has(key)) continue;
    const first = sectionFirstIdx.get(section.id);
    if (first === undefined) continue;
    // rótulo = como a seção está escrita no chart (1ª vez que ela toca no map)
    const label = run.length === secCores.length ? [...run] : run.slice(0, secCores.length);
    if (label.length < 2) continue;
    const mapHits = playOrder.filter((id) => id === section.id).length;
    const occ = Math.max(mapHits, countOccurrences(cores, secCores), 1);
    kept.push({
      key,
      cycle: secCores,
      display: label,
      occ,
      first,
      coverage: coverageRatio(occ, secCores.length, n),
    });
    exactKeys.add(key);
  }

  kept.sort((a, b) => a.first - b.first);

  return kept.map((s, index) => ({
    name: `Progressão ${index + 1}`,
    chords: s.display,
    sections: [] as string[],
    occurrences: s.occ,
  }));
}

/**
 * Progressões — diferencial Cifra Tom (SPEC_014 / ISSUE_007).
 * Manual (song.progressions) vence; senão detecção automática.
 */
export function detectChordSequences(song: Song): ChordSequence[] {
  const byId = new Map(song.sections.map((s) => [s.id, s]));
  const playOrder = song.map && song.map.length > 0 ? song.map : song.sections.map((s) => s.id);

  const cores: string[] = [];
  const display: string[] = [];
  for (const id of playOrder) {
    const section = byId.get(id);
    if (!section) continue;
    for (const chord of sectionChordRun(section)) {
      cores.push(chordCore(chord));
      display.push(chord);
    }
  }
  if (cores.length === 0) return [];

  const manual = song.progressions?.filter((p) => p.chords && p.chords.length >= 2);
  if (manual && manual.length > 0) {
    return manual.map((p, index) => {
      const cyc = p.chords.map(chordCore);
      return {
        name: `Progressão ${index + 1}`,
        chords: p.chords,
        sections: [] as string[],
        occurrences: Math.max(1, countOccurrences(cores, cyc)),
      };
    });
  }

  return detectProgressionsFromSong(song, cores, display);
}
