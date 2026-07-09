import type { NotationMode } from '@/types/music/transform.types';
import type { Tuning } from '@/types/music/tunings.types';
import type { Voicing } from '@/types/music/voicing.types';
import type { Song, SongSection } from './song.types';

export type ViewType = 'chords-lyrics' | 'lyrics' | 'map' | 'chords-only';

/** Parte de linha já processada pelo pipeline (pronta para renderizar). */
export interface RenderedPart {
  /** símbolo original no tom da música (chave para clique/diagrama) */
  chord: string | null;
  /** o que aparece impresso (já transposto/convertido), ou null sem acorde */
  display: string | null;
  text: string;
}

export interface RenderedLine {
  parts: RenderedPart[];
}

export interface RenderedSection {
  id: string;
  tag: string;
  name: string;
  annotation?: string;
  lines: RenderedLine[];
}

export interface SelectedVoicing {
  voicing: Voicing;
  label: string;
}

export interface ScaleDegreeBadge {
  note: string;
  degree: string;
}

export interface ChordSequence {
  name: string;
  chords: string[];
  sections: string[];
}

/**
 * Modelo completo da tela de cifra, produzido por useSongView.hook.ts.
 * Os componentes de src/components/song/ APENAS renderizam este modelo.
 */
export interface SongViewModel {
  song: Song;
  currentKeyName: string;
  shapeKeyName: string;
  transpose: number;
  capo: number;
  notation: NotationMode;
  simplified: boolean;
  tuningId: string;
  tuning: Tuning;
  viewType: ViewType;
  /** passo do tamanho de fonte (8..16, onde 10 = 100%) */
  fontStep: number;
  /** escala aplicada no CSS (fontStep / 10) */
  fontScale: number;
  selectedVoicing: SelectedVoicing | null;
  renderedSections: RenderedSection[];
  /** seções na ordem de execução do mapa (com repetições) */
  mapSections: SongSection[];
  /** graus dos botões de tom relativos ao tom atual */
  scaleDegreeBadges: ScaleDegreeBadge[];
  /** sequências de acordes detectadas na música */
  chordSequences: ChordSequence[];
  selectKeyRoot: (root: string) => void;
  selectChord: (symbol: string) => void;
  setTranspose: (value: number) => void;
  setCapo: (value: number) => void;
  setNotation: (value: NotationMode) => void;
  setSimplified: (value: boolean) => void;
  setTuningId: (id: string) => void;
  setViewType: (value: ViewType) => void;
  setFontStep: (value: number) => void;
}

export interface SongViewProps {
  song: Song;
}

export interface SongHeaderProps {
  view: SongViewModel;
}

export interface SongControlsProps {
  view: SongViewModel;
}

export interface SectionCardProps {
  section: RenderedSection;
  viewType: ViewType;
  onChordClick: (symbol: string) => void;
}

export interface SongMapProps {
  /** seções na ordem tocada, repetições incluídas */
  sections: SongSection[];
}
