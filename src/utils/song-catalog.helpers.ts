import { SONGS } from '@/data/songs';
import type { Song } from '@/types/song/song.types';

export function getAllSongs(): Song[] {
  return Object.values(SONGS);
}

export function getAllSongSlugs(): string[] {
  return Object.keys(SONGS);
}

export function getSongBySlug(slug: string): Song | null {
  return SONGS[slug] ?? null;
}
