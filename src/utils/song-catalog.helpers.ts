import { SONG_COUNT, SONGS } from '@/data/songs';
import type { Song } from '@/types/song/song.types';

export type SortOption = 'title' | 'artist' | 'key' | 'genre';

export function getAllSongs(): Song[] {
  return Object.values(SONGS);
}

export function getAllSongSlugs(): string[] {
  return Object.keys(SONGS);
}

export function getSongBySlug(slug: string): Song | null {
  return SONGS[slug] ?? null;
}

export function getSongCount(): number {
  return SONG_COUNT;
}

export function getGenres(songs: Song[] = getAllSongs()): string[] {
  return [...new Set(songs.map((s) => s.genre).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
}

export function getArtists(songs: Song[] = getAllSongs()): string[] {
  return [...new Set(songs.map((s) => s.artist).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
}

export function getKeys(songs: Song[] = getAllSongs()): string[] {
  const order = [
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'B',
  ];
  const set = new Set(songs.map((s) => s.key || s.originalKey).filter(Boolean));
  return [...set].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export interface CatalogFilters {
  query?: string;
  genre?: string | null;
  artist?: string | null;
  key?: string | null;
  difficulty?: string | null;
  /** D5: busca em sourceText / seções */
  searchLyrics?: boolean;
  sort?: SortOption;
}

export function filterAndSortSongs(songs: Song[], filters: CatalogFilters = {}): Song[] {
  const q = norm(filters.query?.trim() ?? '');
  const genre = filters.genre && filters.genre !== 'Todos' ? filters.genre : null;
  const artist = filters.artist && filters.artist !== 'Todos' ? filters.artist : null;
  const difficulty =
    filters.difficulty && filters.difficulty !== 'Todos' ? filters.difficulty : null;
  const key = filters.key && filters.key !== 'Todos' ? filters.key : null;
  const sort = filters.sort ?? 'title';

  let list = songs.filter((s) => {
    if (genre && s.genre !== genre) return false;
    if (artist && s.artist !== artist) return false;
    if (key && (s.key || s.originalKey) !== key) return false;
    if (difficulty && (s.difficulty ?? '') !== difficulty) return false;
    if (!q) return true;
    let lyricBlob = '';
    if (filters.searchLyrics) {
      lyricBlob =
        (s.sourceText ?? '') +
        ' ' +
        s.sections.flatMap((sec) => sec.lines.flatMap((l) => l.parts.map((p) => p.text))).join(' ');
    }
    const hay = norm(
      `${s.title} ${s.artist} ${s.genre} ${s.key} ${s.originalKey} ${s.slug} ${(s.genres ?? []).join(' ')} ${(s.chords ?? []).join(' ')} ${lyricBlob}`,
    );
    return q.split(/\s+/).every((t) => hay.includes(t));
  });

  list = [...list].sort((a, b) => {
    if (sort === 'artist') {
      const c = a.artist.localeCompare(b.artist, 'pt-BR');
      return c !== 0 ? c : a.title.localeCompare(b.title, 'pt-BR');
    }
    if (sort === 'key') {
      const c = (a.key || a.originalKey).localeCompare(b.key || b.originalKey);
      return c !== 0 ? c : a.title.localeCompare(b.title, 'pt-BR');
    }
    if (sort === 'genre') {
      const c = a.genre.localeCompare(b.genre, 'pt-BR');
      return c !== 0 ? c : a.title.localeCompare(b.title, 'pt-BR');
    }
    return a.title.localeCompare(b.title, 'pt-BR');
  });

  return list;
}
