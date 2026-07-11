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
 * Núcleo harmônico do acorde: raiz + qualidade menor, sem extensões nem baixo.
 * B11 → B, Bm7 → Bm, A/E → A, E4 → E, C#m7(9) → C#m. É a unidade de
 * comparação da "sequência lógica": B e B11 são o mesmo lugar da progressão.
 */
function chordCore(chord: string): string {
  const base = chord.replace(/\/.*$/, '');
  const m = base.match(/^([A-G](?:#|b)?)(m(?!aj))?/);
  if (!m) return base;
  return m[1] + (m[2] ? 'm' : '');
}

/**
 * Blocos equivalem se têm o mesmo tamanho e os mesmos núcleos posição a
 * posição. Extensões variam entre giros (B11 no 1º, B no 2º) sem mudar o
 * padrão; núcleo diferente (E vs C#m) é padrão diferente.
 */
function patternsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (chordCore(a[i]) !== chordCore(b[i])) return false;
  }
  return true;
}

/**
 * Menor período p em que a sequência "gira": chords[i] ≈ chords[i-p] em ≥75%
 * das posições. Tolera variações (B11 no 1º giro, B no 2º) e finais
 * resolvidos, que a compressão exata não pegava.
 */
function findRepeatingPeriod(chords: string[]): number | null {
  const n = chords.length;
  for (let p = 2; p <= Math.floor(n / 2); p++) {
    let matches = 0;
    for (let i = p; i < n; i++) {
      if (chordCore(chords[i]) === chordCore(chords[i - p])) matches++;
    }
    if (matches / (n - p) >= 0.75) return p;
  }
  return null;
}

/**
 * Quebra a sequência bruta de uma seção nos padrões lógicos que ela repete.
 * Ex: "E B/E A/E E E4 ×2 + E B A9 E B ×2" → [E B/E A/E E E4], [E B A9 E B].
 * Um resto curto no fim (acorde de resolução solto) é descartado.
 */
function splitLogicalPatterns(chords: string[]): string[][] {
  if (chords.length < 4) return chords.length > 0 ? [chords] : [];
  const period = findRepeatingPeriod(chords);
  if (!period) return [chords];

  const blocks: string[][] = [];
  for (let i = 0; i < chords.length; i += period) {
    blocks.push(chords.slice(i, i + period));
  }
  const last = blocks[blocks.length - 1];
  if (blocks.length > 1 && last.length <= Math.max(1, Math.floor(period / 3))) {
    blocks.pop();
  }

  const unique: string[][] = [];
  for (const block of blocks) {
    if (!unique.some((u) => patternsMatch(u, block))) unique.push(block);
  }
  return unique;
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

/**
 * Detecta as PROGRESSÕES LÓGICAS da música (padrão de repetição harmônica).
 * Para cada seção, extrai os ciclos que se repetem (com tolerância a
 * variações tipo B11↔B) e agrupa padrões equivalentes entre seções.
 *
 * Conceito alinhado a datasets de progressão (ex.: seções verse/chorus com
 * o mesmo ciclo de acordes) — sem usar dados externos proibidos.
 * Ex. Gratidão (Bruna Olly): E–C#m–B11–A9 é a progressão de Intro/Partes;
 * E–B/E–A/E–E–E4 e E–B–A9–E–B são progressões distintas da 3ª parte.
 */
export function detectChordSequences(song: Song): ChordSequence[] {
  const groups: { chords: string[]; sectionIds: string[] }[] = [];

  for (const section of song.sections) {
    const run = sectionChordRun(section);
    for (const pattern of splitLogicalPatterns(run)) {
      const existing = groups.find((g) => patternsMatch(g.chords, pattern));
      if (existing) {
        if (!existing.sectionIds.includes(section.id)) existing.sectionIds.push(section.id);
      } else {
        groups.push({ chords: pattern, sectionIds: [section.id] });
      }
    }
  }

  // Ordena por quantidade de seções (mais frequente primeiro), preservando
  // a ordem de aparição como desempate.
  const sequences = groups
    .map((g, order) => ({ ...g, order }))
    .sort((a, b) => b.sectionIds.length - a.sectionIds.length || a.order - b.order);

  return sequences.map((seq, index) => {
    const sectionNames = seq.sectionIds
      .map((id) => song.sections.find((s) => s.id === id))
      .filter((s): s is SongSection => s !== undefined)
      .map((s) => s.tag || s.name);
    const isMain = sequences.length === 1 || index === 0;
    return {
      name: isMain ? 'Progressão principal' : `Progressão ${index + 1}`,
      chords: seq.chords,
      sections: sectionNames,
    };
  });
}
