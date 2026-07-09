/**
 * song-view.helpers.ts
 * Funções PURAS que derivam o modelo da tela de cifra a partir do JSON
 * da música + opções de visualização. O estado fica no hook
 * (useSongView.hook.ts); os componentes só renderizam o resultado.
 */

import { chordPitchClasses } from '@/lib/music/chords';
import { keyPrefersFlats, mod12, nameToPc, pcToName } from '@/lib/music/notes';
import { renderChord } from '@/lib/music/transform';
import { findVoicing } from '@/lib/music/voicing';
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

/** Extrai acordes únicos e ordenados de uma seção. */
function sectionChordSequence(section: SongSection): string[] {
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

/** Detecta sequências de acordes repetidas entre seções. */
export function detectChordSequences(song: Song): ChordSequence[] {
  const bySequence = new Map<string, { chords: string[]; sectionIds: string[] }>();
  for (const section of song.sections) {
    const chords = sectionChordSequence(section);
    if (chords.length === 0) continue;
    const key = chords.join('|');
    const existing = bySequence.get(key);
    if (existing) {
      existing.sectionIds.push(section.id);
    } else {
      bySequence.set(key, { chords, sectionIds: [section.id] });
    }
  }

  const sequences = Array.from(bySequence.entries()).map(([_, value]) => value);
  // Ordena por quantidade de seções (mais frequente primeiro)
  sequences.sort((a, b) => b.sectionIds.length - a.sectionIds.length);

  return sequences.map((seq, index) => {
    const sectionNames = seq.sectionIds
      .map((id) => song.sections.find((s) => s.id === id))
      .filter((s): s is SongSection => s !== undefined)
      .map((s) => s.tag || s.name);
    const isMain = sequences.length === 1 || index === 0;
    return {
      name: isMain ? 'Sequência principal' : `Sequência ${index + 1}`,
      chords: seq.chords,
      sections: sectionNames,
    };
  });
}
