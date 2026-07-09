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
  dropD: {
    id: 'dropD',
    label: 'Drop D (DADGBE)',
    strings: [2, 9, 2, 7, 11, 4],
    stringNames: ['D', 'A', 'D', 'G', 'B', 'E'],
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
};

export const TUNING_LIST = Object.values(TUNINGS);
