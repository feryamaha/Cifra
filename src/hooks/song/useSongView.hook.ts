'use client';

/**
 * useSongView.hook.ts
 * TODA a lógica da tela de cifra vive aqui: estado dos controles e
 * derivação do modelo de renderização via funções puras de
 * src/utils/song-view.helpers.ts. Os componentes de src/components/song/
 * recebem o SongViewModel pronto e APENAS renderizam.
 */

import { useMemo, useState } from 'react';
import { TUNINGS } from '@/data/music/tunings.data';
import { mod12, nameToPc } from '@/lib/music/notes';
import type { NotationMode, ViewOptions } from '@/types/music/transform.types';
import type { Song } from '@/types/song/song.types';
import type { SongViewModel, ViewType } from '@/types/song/song-view.types';
import {
  buildMapSections,
  buildRenderedSections,
  buildScaleDegreeBadges,
  detectChordSequences,
  keyNameOf,
  resolveSelectedVoicing,
  transposeForKeyRoot,
} from '@/utils/song-view.helpers';

export function useSongView(song: Song): SongViewModel {
  const originalKeyPc = useMemo(() => nameToPc(song.originalKey) ?? 0, [song.originalKey]);

  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [notation, setNotation] = useState<NotationMode>('letters');
  const [simplified, setSimplified] = useState(false);
  const [tuningId, setTuningId] = useState('standard');
  const [viewType, setViewType] = useState<ViewType>('chords-lyrics');
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [fontStep, setFontStep] = useState(10);

  const opts = useMemo<ViewOptions>(
    () => ({ transpose, capo, notation, simplified, accidentalStyle: 'flat' }),
    [transpose, capo, notation, simplified],
  );

  const currentKeyPc = mod12(originalKeyPc + transpose);
  const shapeKeyPc = mod12(currentKeyPc - capo);
  const currentKeyName = keyNameOf(currentKeyPc);
  const shapeKeyName = keyNameOf(shapeKeyPc);
  const tuning = TUNINGS[tuningId];

  const renderedSections = useMemo(
    () => buildRenderedSections(song, originalKeyPc, opts),
    [song, originalKeyPc, opts],
  );

  const mapSections = useMemo(() => buildMapSections(song), [song]);

  const selectedVoicing = useMemo(
    () => resolveSelectedVoicing(selectedChord, originalKeyPc, opts, tuning),
    [selectedChord, originalKeyPc, opts, tuning],
  );

  const scaleDegreeBadges = useMemo(() => buildScaleDegreeBadges(), []);

  const chordSequences = useMemo(() => detectChordSequences(song), [song]);

  const selectKeyRoot = (root: string) => {
    const semitones = transposeForKeyRoot(root, originalKeyPc);
    if (semitones !== null) setTranspose(semitones);
  };

  return {
    song,
    currentKeyName,
    shapeKeyName,
    transpose,
    capo,
    notation,
    simplified,
    tuningId,
    tuning,
    viewType,
    fontStep,
    fontScale: fontStep / 10,
    selectedVoicing,
    renderedSections,
    mapSections,
    scaleDegreeBadges,
    chordSequences,
    selectKeyRoot,
    selectChord: setSelectedChord,
    setTranspose,
    setCapo,
    setNotation,
    setSimplified,
    setTuningId,
    setViewType,
    setFontStep,
  };
}
