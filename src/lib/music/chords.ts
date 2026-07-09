/**
 * chords.ts
 * Parser de símbolo de acorde -> estrutura { raiz, sufixo, baixo }.
 *
 * Decisão de arquitetura: o sufixo (m, 7M, 9, sus4, dim...) é preservado
 * como texto EXATO. Isso garante que a conversão para números
 * (F7 -> 47, C7M -> 17M) e a transposição nunca "percam" extensões:
 * só a raiz e o baixo são recalculados, o sufixo viaja intacto.
 *
 * Para o motor de shapes (voicing.ts), o sufixo é interpretado
 * separadamente em intervalos relativos (chordToIntervals).
 */

import type { ChordIntervals, ChordPitchClasses, ParsedChord } from '@/types/music/chords.types';
import { mod12, nameToPc } from './notes';

const CHORD_RE = /^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/;

export function parseChord(symbol: string): ParsedChord | null {
  const m = symbol.trim().match(CHORD_RE);
  if (!m) return null;
  const [, root, suffix = '', bass] = m;
  const rootPc = nameToPc(root);
  if (rootPc === null) return null;
  const bassPc = bass ? nameToPc(bass) : null;
  return {
    symbol: symbol.trim(),
    root,
    rootPc,
    suffix,
    bass: bass ?? null,
    bassPc,
  };
}

/**
 * Interpretação pragmática do sufixo em intervalos.
 * Cobre o vocabulário usual de cifra popular brasileira:
 * m, dim/°, aug/+, sus2, sus4, 6, 7, 7M/maj7, 9, add9, 11, 13, b5, #5.
 * Sufixos desconhecidos degradam com segurança para a tríade base.
 */
export function chordToIntervals(suffix: string): ChordIntervals {
  const s = suffix;
  const set = new Set<number>([0]);
  const required: number[] = [0];

  const isMinor = /^m(?!aj)/.test(s);
  const isDim = /(dim|°)/.test(s);
  const isAug = /(aug|\+)/.test(s);
  const isSus2 = /sus2/.test(s);
  const isSus4 = /sus4|sus(?!2)/.test(s);

  let third = 4;
  let fifth: number = 7;
  if (isMinor || isDim) third = 3;
  if (isSus2) third = 2;
  if (isSus4) third = 5;
  if (isDim) fifth = 6;
  if (isAug) fifth = 8;
  if (/(\(|^|[^1])b5/.test(s) && !isDim) fifth = 6;
  if (/#5/.test(s) && !isAug) fifth = 8;

  set.add(third);
  required.push(third);
  set.add(fifth);

  // sétimas e sexta
  const hasMaj7 = /(7M|maj7|Maj7)/.test(s);
  const hasDim7 = /(dim7|°7)/.test(s);
  const has7 = /7/.test(s) && !hasMaj7;
  if (hasMaj7) {
    set.add(11);
    required.push(11);
  } else if (hasDim7) {
    set.add(9);
    required.push(9);
  } else if (has7) {
    set.add(isDim ? 9 : 10); // m7(b5) meio-diminuto usa b7 = 10; dim7 tratado acima
    required.push(isDim ? 9 : 10);
  }
  if (/(^|[^1b#])6/.test(s) && !/13/.test(s)) set.add(9);

  // tensões (opcionais no shape: violão tem 6 cordas, prioriza guias)
  if (/9/.test(s) && !/add9/.test(s)) {
    set.add(2);
    if (!has7 && !hasMaj7) set.add(10); // C9 implica b7 por convenção
  }
  if (/add9/.test(s)) set.add(2);
  if (/11/.test(s)) set.add(5);
  if (/13/.test(s)) set.add(9);

  return { intervals: [...set], required: [...new Set(required)] };
}

/** Pitch classes absolutas do acorde (para o motor de shapes). */
export function chordPitchClasses(chord: ParsedChord): ChordPitchClasses {
  const { intervals, required } = chordToIntervals(chord.suffix);
  const pcs = intervals.map((i) => mod12(chord.rootPc + i));
  const req = required.map((i) => mod12(chord.rootPc + i));
  const bassPc = chord.bassPc ?? chord.rootPc;
  if (!pcs.includes(bassPc)) pcs.push(bassPc);
  return { pcs, required: req, bassPc };
}
