/**
 * Schema Zod estrutural de Song (payload de API).
 * Substitui z.custom<Song>() fraco — campos e limites explícitos.
 */

import { z } from 'zod';
import type { Song } from '@/types/song/song.types';

const songPartSchema = z
  .object({
    chord: z.string().max(40).nullable(),
    text: z.string().max(500),
  })
  .strict();

const songLineSchema = z
  .object({
    parts: z.array(songPartSchema).max(200),
  })
  .strict();

const sectionTypeSchema = z.enum([
  'intro',
  'verse',
  'prechorus',
  'chorus',
  'bridge',
  'interlude',
  'solo',
  'ending',
]);

const songSectionSchema = z
  .object({
    id: z.string().min(1).max(80),
    type: sectionTypeSchema,
    tag: z.string().max(40),
    name: z.string().max(80),
    annotation: z.string().max(200).optional(),
    lines: z.array(songLineSchema).max(500),
  })
  .strict();

/** Payload de cifra aceito em POST/PUT (usuário e admin). */
export const songPayloadSchema = z
  .object({
    id: z.string().max(80).optional(),
    slug: z.string().min(1).max(120),
    title: z.string().trim().min(1).max(160),
    artist: z.string().max(120).default(''),
    genre: z.string().max(80).default(''),
    key: z.string().max(20).default('C'),
    originalKey: z.string().max(20).default('C'),
    tuning: z.string().max(40).default('standard'),
    chords: z.array(z.string().max(40)).max(200).default([]),
    bpm: z.number().int().min(20).max(400).optional(),
    timeSignature: z.string().max(16).default('4/4'),
    map: z.array(z.string().max(40)).max(100).default([]),
    sections: z.array(songSectionSchema).min(1).max(100),
    genres: z.array(z.string().max(40)).max(20).optional(),
    source: z.enum(['demo', 'harpa', 'cantor', 'user']).default('user'),
    sourceText: z.string().max(100_000).optional(),
    published: z.boolean().optional(),
    videoUrl: z.string().url().max(500).optional(),
    difficulty: z.enum(['iniciante', 'intermediario', 'avancado']).optional(),
  })
  .strict();

export type SongPayload = z.infer<typeof songPayloadSchema>;

function songHasChords(song: SongPayload): boolean {
  if (song.chords.length > 0) return true;
  return song.sections.some((sec) => sec.lines.some((l) => l.parts.some((p) => p.chord)));
}

/**
 * Valida e normaliza payload de Song.
 * Falha se estrutura inválida ou sem nenhum acorde.
 */
export function parseSongPayload(input: unknown): { ok: true; song: Song } | { ok: false } {
  const parsed = songPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  if (!songHasChords(parsed.data)) return { ok: false };
  const d = parsed.data;
  const song: Song = {
    id: d.id ?? crypto.randomUUID(),
    slug: d.slug,
    title: d.title,
    artist: d.artist,
    genre: d.genre,
    key: d.key || d.originalKey || 'C',
    originalKey: d.originalKey || d.key || 'C',
    tuning: d.tuning,
    chords: d.chords,
    bpm: d.bpm,
    timeSignature: d.timeSignature,
    map: d.map,
    sections: d.sections,
    genres: d.genres,
    source: d.source,
    sourceText: d.sourceText,
    published: d.published,
    videoUrl: d.videoUrl,
    difficulty: d.difficulty,
  };
  return { ok: true, song };
}
