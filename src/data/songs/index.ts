/**
 * Catálogo estático: apenas músicas COM cifras (sequência de acordes).
 * Fontes: demos Cifra Tom originais.
 * Usuário: localStorage (client).
 *
 * Proibido no catálogo: Chordonomicon, Spotify, scrapes comerciais,
 * hinários só-letra.
 */

import type { Song } from '@/types/song/song.types';
import estradaDeTerra from './estrada-de-terra.json';
import luzDaEstrada from './luz-da-estrada.json';
import marDePedra from './mar-de-pedra.json';
import noiteEmD from './noite-em-d.json';

function collectChords(sections: Song['sections']): string[] {
  const out: string[] = [];
  for (const sec of sections) {
    for (const line of sec.lines) {
      for (const part of line.parts) {
        if (part.chord) out.push(part.chord);
      }
    }
  }
  return out;
}

function asSong(raw: Record<string, unknown>, defaults: Partial<Song>): Song | null {
  const sections = (raw.sections as Song['sections']) ?? [];
  const chords =
    Array.isArray(raw.chords) && (raw.chords as string[]).length > 0
      ? (raw.chords as string[])
      : collectChords(sections);

  // Regra de produto: sem acordes = fora do catálogo
  if (chords.length === 0) return null;

  const originalKey = String(raw.originalKey ?? raw.key ?? defaults.originalKey ?? 'C');
  return {
    id: String(raw.id),
    slug: String(raw.slug),
    title: String(raw.title),
    artist: String(raw.artist ?? defaults.artist ?? 'Desconhecido'),
    genre: String(raw.genre ?? defaults.genre ?? 'Demo'),
    key: String(raw.key ?? originalKey),
    originalKey,
    tuning: String(raw.tuning ?? defaults.tuning ?? 'standard'),
    chords,
    bpm: raw.bpm != null ? Number(raw.bpm) : defaults.bpm,
    timeSignature: String(raw.timeSignature ?? '4/4'),
    map: (raw.map as string[]) ?? sections.map((s) => s.id),
    sections,
    genres: (raw.genres as string[]) ?? defaults.genres,
    source: (raw.source as Song['source']) ?? defaults.source ?? 'demo',
  };
}

const rawDemos = [estradaDeTerra, luzDaEstrada, marDePedra, noiteEmD] as Record<string, unknown>[];

export const SONGS: Record<string, Song> = {};

for (const raw of rawDemos) {
  const song = asSong(raw, {
    genre: 'Demo',
    source: 'demo',
    artist: 'Cifra Tom Demo',
  });
  if (song) SONGS[song.slug] = song;
}

export const SONG_COUNT = Object.keys(SONGS).length;
