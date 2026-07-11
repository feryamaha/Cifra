/**
 * tunings.data.ts
 * Cada afinação é uma matriz de 6 pitch classes, da corda 6 (mais grave)
 * para a corda 1 (mais aguda). O motor de shapes (lib/music/voicing.ts)
 * usa essa matriz como base do cálculo: nota_soada = (corda_solta + traste) mod 12.
 */

import type { Tuning } from '@/types/music/tunings.types';

export const TUNINGS: Record<string, Tuning> = {
  standard: {
    id: 'standard',
    label: 'Padrão (EADGBE)',
    strings: [4, 9, 2, 7, 11, 4],
    stringNames: ['E', 'A', 'D', 'G', 'B', 'E'],
  },
  halfStepDown: {
    id: 'halfStepDown',
    label: '½ tom abaixo (EbAbDbGbBbEb)',
    strings: [3, 8, 1, 6, 10, 3],
    stringNames: ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'],
  },
  fullStepDown: {
    id: 'fullStepDown',
    label: '1 tom abaixo (DGCFAD)',
    strings: [2, 7, 0, 5, 9, 2],
    stringNames: ['D', 'G', 'C', 'F', 'A', 'D'],
  },
  dropD: {
    id: 'dropD',
    label: 'Drop D (DADGBE)',
    strings: [2, 9, 2, 7, 11, 4],
    stringNames: ['D', 'A', 'D', 'G', 'B', 'E'],
  },
  dropC: {
    id: 'dropC',
    label: 'Drop C (CGCFAD)',
    strings: [0, 7, 0, 5, 9, 2],
    stringNames: ['C', 'G', 'C', 'F', 'A', 'D'],
  },
  dadgad: {
    id: 'dadgad',
    label: 'DADGAD',
    strings: [2, 9, 2, 7, 9, 2],
    stringNames: ['D', 'A', 'D', 'G', 'A', 'D'],
  },
  openG: {
    id: 'openG',
    label: 'Open G (DGDGBD)',
    strings: [2, 7, 2, 7, 11, 2],
    stringNames: ['D', 'G', 'D', 'G', 'B', 'D'],
  },
  openD: {
    id: 'openD',
    label: 'Open D (DADF#AD)',
    strings: [2, 9, 2, 6, 9, 2],
    stringNames: ['D', 'A', 'D', 'F#', 'A', 'D'],
  },
  openE: {
    id: 'openE',
    label: 'Open E (EBEG#BE)',
    strings: [4, 11, 4, 8, 11, 4],
    stringNames: ['E', 'B', 'E', 'G#', 'B', 'E'],
  },
  openA: {
    id: 'openA',
    label: 'Open A (EAEAC#E)',
    strings: [4, 9, 4, 9, 1, 4],
    stringNames: ['E', 'A', 'E', 'A', 'C#', 'E'],
  },
};

export const TUNING_LIST = Object.values(TUNINGS);

/** Afinação de referência para o mapa visual de mudanças. */
export const STANDARD_TUNING = TUNINGS.standard;
