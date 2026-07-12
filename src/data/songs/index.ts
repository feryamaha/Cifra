/**
 * Catálogo estático: VAZIO desde a SPEC_010 (A1/A3).
 * As 4 demos fake eram fixture de validação de UI e foram excluídas por
 * ordem do Fernando (2026-07-11). O catálogo real vive no Neon
 * (works + song_versions published) via src/lib/songs/server-catalog.ts.
 *
 * Proibido no catálogo: Chordonomicon, Spotify, scrapes comerciais,
 * hinários só-letra.
 */

import type { Song } from '@/types/song/song.types';

export const SONGS: Record<string, Song> = {};

export const SONG_COUNT = 0;
