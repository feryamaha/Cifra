/**
 * notes.ts
 * Matriz cromática de 12 semitons e regras de ortografia (sustenidos vs bemóis).
 *
 * Toda a matemática do site se apoia em uma única representação canônica:
 * PitchClass = inteiro 0..11, onde C = 0, C# = 1, ..., B = 11.
 * Transposição = aritmética modular: (pc + n) mod 12.
 */

import type { PitchClass } from '@/types/music/notes.types';

export const SHARP_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const FLAT_NAMES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

/** Mapa nome -> pitch class, com enarmônicos. */
export const NOTE_TO_PC: Record<string, PitchClass> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  'E#': 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

/**
 * Tons maiores que, por armadura de clave, preferem bemóis:
 * F(1b) Bb(2b) Eb(3b) Ab(4b) Db(5b).
 * O pc 6 é ambíguo (F# 6 sustenidos vs Gb 6 bemóis); a cifra popular
 * brasileira usa F#, então pc 6 fica no lado dos sustenidos.
 * Todos os demais usam sustenidos (C usa sustenidos por convenção prática de cifra).
 */
const FLAT_KEY_PCS = new Set<PitchClass>([5, 10, 3, 8, 1]);

export function keyPrefersFlats(keyPc: PitchClass): boolean {
  return FLAT_KEY_PCS.has(((keyPc % 12) + 12) % 12);
}

export function pcToName(pc: PitchClass, useFlats: boolean): string {
  const i = ((pc % 12) + 12) % 12;
  return useFlats ? FLAT_NAMES[i] : SHARP_NAMES[i];
}

export function nameToPc(name: string): PitchClass | null {
  const pc = NOTE_TO_PC[name];
  return pc === undefined ? null : pc;
}

export function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}
