/**
 * Músicas do usuário — sessionStorage, sempre com cifras.
 */

import { isChordToken, normalizeChord } from '@/lib/parsers/chord-utils';
import type { SongDraft } from '@/lib/parsers/types';
import type { Song, SongProgression, UserSongInput } from '@/types/song/song.types';
import { detectChordSequences } from '@/utils/song-view.helpers';

export const USER_SONGS_KEY = 'cifratom.user-songs.v1';
const LEGACY_USER_SONGS_KEY = 'cifralab.user-songs.v1';

/**
 * ID local (sessionStorage) com CSPRNG (R26 / CWE-338).
 * Prefixo `u_` mantido para compatibilidade de slugs/legado.
 */
function newUserSongId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `u_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return `u_${hex}`;
}

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `user-${base || 'musica'}-${id}`;
}

export function parseChordsText(text: string): string[] {
  // valida token a token: "Como", "Aleluia", "De" começam com A–G mas não são acordes
  return text
    .split(/[\s,|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && isChordToken(t))
    .map((t) => normalizeChord(t));
}

/**
 * Uma progressão por linha; acordes separados por espaço.
 * Linhas vazias ou com menos de 2 acordes válidos são ignoradas.
 */
export function parseProgressionsText(text: string): SongProgression[] {
  return text
    .split(/\r?\n/)
    .map((line) => parseChordsText(line))
    .filter((chords) => chords.length >= 2)
    .map((chords) => ({ chords }))
    .slice(0, 20);
}

/** Serializa progressões para textarea (edição). */
export function progressionsToText(list: SongProgression[] | undefined): string {
  if (!list?.length) return '';
  return list.map((p) => p.chords.join(' ')).join('\n');
}

/**
 * SPEC_014 B1–B2: se progressions vazio/ausente, roda o algoritmo e grava no song.
 * Se já preenchido, não sobrescreve (humano manda).
 */
export function applyAutoProgressionsIfEmpty(song: Song): Song {
  const has = song.progressions?.some((p) => p.chords && p.chords.length >= 2);
  if (has) return song;
  const detected = detectChordSequences({ ...song, progressions: undefined });
  if (detected.length === 0) return { ...song, progressions: undefined };
  return {
    ...song,
    progressions: detected.map((d) => ({ chords: [...d.chords] })),
  };
}

export function userSongFromInput(input: UserSongInput): Song {
  const id = newUserSongId();
  const chords = parseChordsText(input.chordsText);
  if (chords.length === 0) {
    throw new Error('A música precisa ter pelo menos um acorde.');
  }
  const key = input.key || 'C';
  const sectionId = 'main';
  const parts = chords.map((chord) => ({ chord, text: '        ' }));

  return {
    id,
    slug: slugify(input.title, id.replace(/^u_/, '')),
    title: input.title.trim(),
    artist: input.artist.trim() || 'Eu',
    genre: input.genre.trim() || 'Cifras',
    key,
    originalKey: key,
    tuning: input.tuning || 'standard',
    chords,
    timeSignature: '4/4',
    source: 'user',
    map: [sectionId],
    sections: [
      {
        id: sectionId,
        type: 'verse',
        tag: 'Cifra',
        name: 'Progressão de acordes',
        lines: [{ parts }],
      },
    ],
  };
}

export function userSongFromDraft(
  draft: SongDraft,
  opts?: { progressions?: SongProgression[] },
): Song {
  if (!draft.title.trim()) throw new Error('Informe o título.');
  if (draft.chords.length === 0) throw new Error('A música precisa ter pelo menos um acorde.');

  const id = newUserSongId();
  const key = draft.key || 'C';
  const progressions = opts?.progressions?.filter((p) => p.chords.length >= 2);

  return {
    id,
    slug: slugify(draft.title, id.replace(/^u_/, '')),
    title: draft.title.trim(),
    artist: draft.artist.trim() || 'Eu',
    genre: draft.genre.trim() || 'Cifras',
    key,
    originalKey: key,
    tuning: draft.tuning || 'standard',
    // Únicos na ordem de aparição: draft.chords traz OCORRÊNCIAS (uma música
    // longa passa de 200 e estourava o teto do schema Zod: falso positivo
    // "cifra inválida" no import em lote)
    chords: [...new Set(draft.chords)],
    bpm: draft.bpm,
    timeSignature: draft.timeSignature || '4/4',
    source: 'user',
    map: draft.map.length ? draft.map : draft.sections.map((s) => s.id),
    sections: draft.sections.map((s) => ({
      id: s.id,
      type: (s.type as Song['sections'][0]['type']) || 'verse',
      tag: s.tag,
      name: s.name,
      lines: s.lines,
    })),
    sourceText: draft.sourceText,
    ...(progressions && progressions.length > 0 ? { progressions } : {}),
  };
}

/**
 * Reconstrói o texto de cifra (acorde em cima da letra) a partir da música
 * salva. Fallback de edição para cifras antigas sem sourceText.
 */
export function songToChartText(song: Song): string {
  const out: string[] = [];
  for (const section of song.sections) {
    out.push(`[${section.name}]`);
    for (const line of section.lines) {
      let chordLine = '';
      let lyricLine = '';
      for (const part of line.parts) {
        if (part.chord) {
          if (chordLine.length < lyricLine.length) {
            chordLine += ' '.repeat(lyricLine.length - chordLine.length);
          } else if (chordLine.length > 0) {
            chordLine += ' ';
          }
          chordLine += part.chord;
        }
        lyricLine += part.text ?? '';
      }
      if (chordLine.trim()) out.push(chordLine.trimEnd());
      if (lyricLine.trim()) out.push(lyricLine.trimEnd());
    }
    out.push('');
  }
  return out.join('\n').trim();
}

export function loadUserSongs(): Song[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = sessionStorage.getItem(USER_SONGS_KEY);
    // migração do rebrand: CifraLab → Cifra Tom
    if (!raw) {
      const legacy = sessionStorage.getItem(LEGACY_USER_SONGS_KEY);
      if (legacy) {
        sessionStorage.setItem(USER_SONGS_KEY, legacy);
        sessionStorage.removeItem(LEGACY_USER_SONGS_KEY);
        raw = legacy;
      }
    }
    if (!raw) return [];
    const list = JSON.parse(raw) as Song[];
    return Array.isArray(list)
      ? list
          .map(normalizeUserSong)
          .filter((s) => (s.chords?.length ?? 0) > 0 || songHasChordParts(s))
      : [];
  } catch {
    return [];
  }
}

function songHasChordParts(s: Song): boolean {
  for (const sec of s.sections ?? []) {
    for (const line of sec.lines) {
      for (const p of line.parts) {
        if (p.chord) return true;
      }
    }
  }
  return false;
}

function normalizeUserSong(s: Song): Song {
  const genre = s.genre === 'Minhas cifras' || !s.genre ? 'Cifras' : s.genre;
  return {
    ...s,
    key: s.key || s.originalKey || 'C',
    originalKey: s.originalKey || s.key || 'C',
    tuning: s.tuning || 'standard',
    chords: s.chords ?? [],
    genre,
    source: 'user',
  };
}

export function saveUserSongs(songs: Song[]): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(USER_SONGS_KEY, JSON.stringify(songs));
}

export function addUserSong(input: UserSongInput): Song {
  const song = userSongFromInput(input);
  const all = loadUserSongs();
  all.unshift(song);
  saveUserSongs(all);
  return song;
}

export function addUserSongFromDraft(draft: SongDraft): Song {
  const song = userSongFromDraft(draft);
  const all = loadUserSongs();
  all.unshift(song);
  saveUserSongs(all);
  return song;
}

/**
 * Substitui uma cifra existente pelo resultado de um novo parse,
 * preservando id e slug (a URL da música não muda).
 */
export function updateUserSongFromDraft(id: string, draft: SongDraft): Song {
  const all = loadUserSongs();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Cifra não encontrada para editar.');
  const fresh = userSongFromDraft(draft);
  const updated: Song = { ...fresh, id, slug: all[idx].slug };
  all[idx] = updated;
  saveUserSongs(all);
  return updated;
}

export function removeUserSong(id: string): void {
  saveUserSongs(loadUserSongs().filter((s) => s.id !== id));
}

export function getUserSongBySlug(slug: string): Song | null {
  return loadUserSongs().find((s) => s.slug === slug) ?? null;
}
