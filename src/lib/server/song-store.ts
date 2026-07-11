/**
 * Store de músicas no SERVIDOR (arquivos JSON em src/data/store/).
 *
 * Camadas do catálogo:
 *  - demos estáticos (src/data/songs) — publicados por padrão;
 *  - overrides do admin (editar/despublicar/excluir demos + músicas aprovadas);
 *  - fila de submissões de usuários (nunca publicadas automaticamente).
 *
 * Persistência em arquivo funciona em dev/self-host. Em deploy serverless
 * (filesystem read-only) este módulo precisa ser trocado por um banco.
 *
 * IMPORTANTE: módulo somente-servidor (usa node:fs) — não importar em
 * componentes client. O store runtime NÃO deve ser importado como módulo
 * estático do client; só lido/escrito via fs neste arquivo.
 */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SONGS } from '@/data/songs';
import { parseSongPayload } from '@/lib/security/song-schema';
import type { Song } from '@/types/song/song.types';

/** Runtime de moderação/publicação — sempre sob src/data (sem pasta data/ na raiz). */
const STORE_DIR = join(process.cwd(), 'src', 'data', 'store');
const OVERRIDES_FILE = join(STORE_DIR, 'overrides.json');

/** Override do admin sobre um slug do catálogo (ou música nova do store). */
export interface SongOverride {
  /** substituição completa da música (edição/aprovação) */
  song?: Song;
  /** visibilidade pública; default true para demos */
  published?: boolean;
  /** tombstone: some do catálogo (inclusive para o admin) */
  deleted?: boolean;
  updatedAt: string;
}

export interface Submission {
  id: string;
  submittedAt: string;
  song: Song;
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown): void {
  mkdirSync(STORE_DIR, { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  renameSync(tmp, file);
}

// ---------- overrides ----------

export function getOverrides(): Record<string, SongOverride> {
  return readJson<Record<string, SongOverride>>(OVERRIDES_FILE, {});
}

export function saveOverride(slug: string, patch: Partial<SongOverride>): SongOverride {
  const all = getOverrides();
  const next: SongOverride = { ...all[slug], ...patch, updatedAt: new Date().toISOString() };
  all[slug] = next;
  writeJson(OVERRIDES_FILE, all);
  return next;
}

// ---------- submissões JSON legadas (W6: desativadas; moderação = Postgres) ----------

/** @deprecated fila legada desativada — sempre []. */
export function listSubmissions(): Submission[] {
  return [];
}

/** @deprecated não grava — use POST /api/versions. */
export function addSubmission(_song: Song): never {
  throw new Error('Fila JSON legada desativada.');
}

/** @deprecated não-op. */
export function removeSubmission(_id: string): Submission | null {
  return null;
}

/** @deprecated não-op. */
export function approveSubmission(_id: string): Song | null {
  return null;
}

// ---------- catálogo montado ----------

/** Valida payload vindo de fora (submissão/edição) antes de persistir — schema Zod. */
export function validateSongPayload(song: unknown): song is Song {
  return parseSongPayload(song).ok;
}

export interface CatalogEntry extends Song {
  published: boolean;
}

/**
 * Catálogo do servidor: demos + overrides do admin.
 * `admin=false` filtra não-publicadas; `admin=true` devolve tudo com o flag.
 */
export function getCatalog(opts: { admin: boolean }): CatalogEntry[] {
  const overrides = getOverrides();
  const bySlug = new Map<string, CatalogEntry>();

  for (const song of Object.values(SONGS)) {
    bySlug.set(song.slug, { ...song, published: true });
  }
  for (const [slug, ov] of Object.entries(overrides)) {
    if (ov.deleted) {
      bySlug.delete(slug);
      continue;
    }
    const base = ov.song ?? bySlug.get(slug);
    if (!base) continue;
    bySlug.set(slug, { ...base, published: ov.published !== false });
  }

  const all = [...bySlug.values()];
  return opts.admin ? all : all.filter((s) => s.published);
}

export function getCatalogSongBySlug(slug: string, opts: { admin: boolean }): CatalogEntry | null {
  return getCatalog(opts).find((s) => s.slug === slug) ?? null;
}
