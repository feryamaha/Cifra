import type { NotationMode } from '@/types/music/transform.types';
import type { Tuning } from '@/types/music/tunings.types';
import type { Voicing } from '@/types/music/voicing.types';
import type { Song, SongSection } from './song.types';

export type ViewType = 'chords-lyrics' | 'lyrics' | 'map' | 'chords-only';

export interface RenderedPart {
  chord: string | null;
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
  twoColumns: boolean;
  lefty: boolean;
  inlineDiagrams: boolean;
  fontStep: number;
  fontScale: number;
  selectedChord: string | null;
  selectedVoicing: SelectedVoicing | null;
  resolveVoicing: (originalSymbol: string) => SelectedVoicing | null;
  resolveVoicings: (originalSymbol: string) => { label: string; voicings: Voicing[] } | null;
  renderedSections: RenderedSection[];
  mapSections: SongSection[];
  scaleDegreeBadges: ScaleDegreeBadge[];
  chordSequences: ChordSequence[];
  uniqueChords: string[];
  deepLinkQuery: string;
  selectKeyRoot: (root: string) => void;
  selectChord: (symbol: string) => void;
  setTranspose: (value: number) => void;
  setCapo: (value: number) => void;
  setNotation: (value: NotationMode) => void;
  setSimplified: (value: boolean) => void;
  setTuningId: (id: string) => void;
  setViewType: (value: ViewType) => void;
  setFontStep: (value: number) => void;
  setTwoColumns: (value: boolean) => void;
  setLefty: (value: boolean) => void;
  setInlineDiagrams: (value: boolean) => void;
}

export interface SongViewProps {
  song: Song;
  /** SPEC_010 C3: único ponto de ad na página de cifra = fim do aside */
  adsOn?: boolean;
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
  selectedChord: string | null;
  tuning: Tuning;
  resolveVoicing: (originalSymbol: string) => SelectedVoicing | null;
  resolveVoicings: (originalSymbol: string) => { label: string; voicings: Voicing[] } | null;
  onChordClick: (symbol: string) => void;
  lefty?: boolean;
  inlineDiagrams?: boolean;
}

export interface SongMapProps {
  sections: SongSection[];
}
