import type { NotationMode } from '@/types/music/transform.types';
import type { ViewType } from '@/types/song/song-view.types';
import type { SegmentOption } from '@/types/ui/segmented-control.types';

export const KEY_BUTTONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/** Presets MultiTracks-like + intermediários (SPEC_006 E7) */
export const CAPO_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 9];
export const CAPO_PRESETS = [0, 2, 4, 5, 7, 9];

export const TRANSPOSE_LIMITS = { min: -11, max: 11 };
export const FONT_STEP_LIMITS = { min: 8, max: 16 };

export const NOTATION_OPTIONS: SegmentOption<NotationMode>[] = [
  { value: 'letters', label: 'Letras' },
  { value: 'numbers', label: 'Números' },
  { value: 'roman', label: 'Numerais' },
  { value: 'solfege', label: 'Do Re Mi' },
];

export const VIEW_TYPE_OPTIONS: SegmentOption<ViewType>[] = [
  { value: 'chords-lyrics', label: 'Acordes + Letra' },
  { value: 'lyrics', label: 'Letra' },
  { value: 'map', label: 'Mapa da Música' },
  { value: 'chords-only', label: 'Apenas Acordes' },
];
