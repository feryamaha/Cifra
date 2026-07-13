'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TUNINGS } from '@/data/music/tunings.data';
import { mod12, nameToPc } from '@/lib/music/notes';
import { buildSongDeepLinkQuery, parseSongDeepLink } from '@/lib/share/deep-link';
import type { NotationMode, ViewOptions } from '@/types/music/transform.types';
import type { Song } from '@/types/song/song.types';
import type { SongViewModel, ViewType } from '@/types/song/song-view.types';
import {
  buildMapSections,
  buildRenderedSections,
  buildScaleDegreeBadges,
  collectUniqueChords,
  detectChordSequences,
  keyNameOf,
  resolveChordVoicings,
  resolveSelectedVoicing,
  transposeForKeyRoot,
} from '@/utils/song-view.helpers';

export function useSongView(song: Song): SongViewModel {
  const originalKeyPc = useMemo(() => nameToPc(song.originalKey) ?? 0, [song.originalKey]);

  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [notation, setNotation] = useState<NotationMode>('letters');
  const [simplified, setSimplified] = useState(false);
  const [tuningId, setTuningId] = useState(song.tuning || 'standard');
  const [viewType, setViewType] = useState<ViewType>('chords-lyrics');
  const [twoColumns, setTwoColumns] = useState(false);
  const [lefty, setLefty] = useState(false);
  const [inlineDiagrams, setInlineDiagrams] = useState(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [fontStep, setFontStep] = useState(10);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = parseSongDeepLink(window.location.search);
    if (p.transpose !== undefined) setTranspose(p.transpose);
    if (p.capo !== undefined) setCapo(p.capo);
    if (p.tuningId) setTuningId(p.tuningId);
    if (p.notation) setNotation(p.notation);
    if (p.simplified !== undefined) setSimplified(p.simplified);
    if (p.viewType) setViewType(p.viewType);
    if (p.twoColumns !== undefined) setTwoColumns(p.twoColumns);
    if (p.lefty !== undefined) setLefty(p.lefty);
    if (p.inlineDiagrams !== undefined) setInlineDiagrams(p.inlineDiagrams);
    setHydrated(true);
  }, []);

  const deepLinkQuery = useMemo(
    () =>
      buildSongDeepLinkQuery({
        transpose,
        capo,
        tuningId,
        notation,
        simplified,
        viewType,
        twoColumns,
        lefty,
        inlineDiagrams,
      }),
    [transpose, capo, tuningId, notation, simplified, viewType, twoColumns, lefty, inlineDiagrams],
  );

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const path = window.location.pathname;
    const next = `${path}${deepLinkQuery}`;
    const current = `${path}${window.location.search}`;
    if (next !== current) window.history.replaceState(null, '', next);
  }, [deepLinkQuery, hydrated]);

  const opts = useMemo<ViewOptions>(
    () => ({ transpose, capo, notation, simplified, accidentalStyle: 'flat' }),
    [transpose, capo, notation, simplified],
  );

  const currentKeyPc = mod12(originalKeyPc + transpose);
  const shapeKeyPc = mod12(currentKeyPc - capo);
  const currentKeyName = keyNameOf(currentKeyPc);
  const shapeKeyName = keyNameOf(shapeKeyPc);
  const tuning = TUNINGS[tuningId] ?? TUNINGS.standard;

  const renderedSections = useMemo(
    () => buildRenderedSections(song, originalKeyPc, opts),
    [song, originalKeyPc, opts],
  );
  const mapSections = useMemo(() => buildMapSections(song), [song]);
  const resolveVoicing = useCallback(
    (originalSymbol: string) => resolveSelectedVoicing(originalSymbol, originalKeyPc, opts, tuning),
    [originalKeyPc, opts, tuning],
  );
  const resolveVoicings = useCallback(
    (originalSymbol: string) =>
      resolveChordVoicings(originalSymbol, originalKeyPc, opts, tuning, 12),
    [originalKeyPc, opts, tuning],
  );
  const selectedVoicing = useMemo(
    () => (selectedChord ? resolveVoicing(selectedChord) : null),
    [selectedChord, resolveVoicing],
  );
  const scaleDegreeBadges = useMemo(() => buildScaleDegreeBadges(), []);
  const chordSequences = useMemo(() => detectChordSequences(song), [song]);
  const uniqueChords = useMemo(() => collectUniqueChords(song), [song]);

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
    twoColumns,
    lefty,
    inlineDiagrams,
    fontStep,
    fontScale: fontStep / 10,
    selectedChord,
    selectedVoicing,
    resolveVoicing,
    resolveVoicings,
    renderedSections,
    mapSections,
    scaleDegreeBadges,
    chordSequences,
    uniqueChords,
    deepLinkQuery,
    selectKeyRoot,
    selectChord: setSelectedChord,
    setTranspose,
    setCapo,
    setNotation,
    setSimplified,
    setTuningId,
    setViewType,
    setFontStep,
    setTwoColumns,
    setLefty,
    setInlineDiagrams,
  };
}
