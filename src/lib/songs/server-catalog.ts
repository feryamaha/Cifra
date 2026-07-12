/**
 * Catálogo unificado: 100% Neon Postgres (works + song_versions published).
 * A camada de arquivos (demos fake + overrides.json) foi aposentada na
 * SPEC_010 (A1/A3/A4): demos eram fixture de validação de UI e foram
 * excluídas por ordem do Fernando; catálogo real vive no banco.
 */

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import type { Song } from '@/types/song/song.types';

export interface CatalogEntry extends Song {
  published: boolean;
}

/** NFC: títulos vindos do DB podem estar em NFD (ISSUE_004 §6). */
function nfc(s: string): string {
  return typeof s === 'string' ? s.normalize('NFC') : s;
}

function rowToEntry(
  version: typeof songVersions.$inferSelect,
  work: typeof works.$inferSelect,
): CatalogEntry {
  const payload = version.payload as Song;
  return {
    ...payload,
    id: version.id,
    slug: version.slug,
    title: nfc(work.title),
    artist: nfc(work.artist),
    published: version.status === 'published',
    source: payload.source ?? 'user',
  };
}

export async function listPublishedVersions(): Promise<CatalogEntry[]> {
  try {
    const rows = await db
      .select({ version: songVersions, work: works })
      .from(songVersions)
      .innerJoin(works, eq(songVersions.workId, works.id))
      .where(eq(songVersions.status, 'published'))
      .orderBy(desc(songVersions.publishedAt));
    return rows.map(({ version, work }) => rowToEntry(version, work));
  } catch {
    return [];
  }
}

export async function listPendingVersions() {
  try {
    return await db
      .select({
        id: songVersions.id,
        slug: songVersions.slug,
        status: songVersions.status,
        label: songVersions.label,
        authorId: songVersions.authorId,
        createdAt: songVersions.createdAt,
        payload: songVersions.payload,
        workTitle: works.title,
        workArtist: works.artist,
      })
      .from(songVersions)
      .innerJoin(works, eq(songVersions.workId, works.id))
      .where(eq(songVersions.status, 'pending_review'))
      .orderBy(desc(songVersions.createdAt));
  } catch {
    return [];
  }
}

export async function getUnifiedCatalog(opts: { admin: boolean }): Promise<CatalogEntry[]> {
  // admin=true hoje equivale ao mesmo conjunto published; rascunhos/pending
  // são geridos pelas rotas de moderação, não pelo catálogo.
  const published = await listPublishedVersions();
  return opts.admin ? published : published.filter((s) => s.published);
}

/**
 * Busca por slug direto no índice unique (SPEC_010 A2 / ISSUE_004 L2):
 * 1 linha por request, sem carregar o catálogo inteiro.
 */
export async function getUnifiedSongBySlug(
  slug: string,
  opts: { admin: boolean },
): Promise<CatalogEntry | null> {
  try {
    // Público: só published. Admin: qualquer status (editar/despublicar).
    const where = opts.admin
      ? eq(songVersions.slug, slug)
      : and(eq(songVersions.slug, slug), eq(songVersions.status, 'published'));
    const rows = await db
      .select({ version: songVersions, work: works })
      .from(songVersions)
      .innerJoin(works, eq(songVersions.workId, works.id))
      .where(where)
      .limit(1);
    if (rows.length === 0) return null;
    return rowToEntry(rows[0].version, rows[0].work);
  } catch {
    return null;
  }
}
