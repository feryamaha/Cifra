/**
 * Catálogo unificado: demos estáticos + versões published no Postgres.
 */

import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import {
  type CatalogEntry,
  getCatalogSongBySlug,
  getCatalog as getFileCatalog,
} from '@/lib/server/song-store';
import type { Song } from '@/types/song/song.types';

export async function listPublishedVersions(): Promise<CatalogEntry[]> {
  try {
    const rows = await db
      .select({
        version: songVersions,
        work: works,
      })
      .from(songVersions)
      .innerJoin(works, eq(songVersions.workId, works.id))
      .where(eq(songVersions.status, 'published'))
      .orderBy(desc(songVersions.publishedAt));

    return rows.map(({ version, work }) => {
      const payload = version.payload as Song;
      return {
        ...payload,
        id: version.id,
        slug: version.slug,
        title: work.title,
        artist: work.artist,
        published: true,
        source: payload.source ?? 'user',
      };
    });
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
  const file = getFileCatalog(opts);
  const published = await listPublishedVersions();
  const bySlug = new Map<string, CatalogEntry>();
  for (const s of file) bySlug.set(s.slug, s);
  for (const s of published) bySlug.set(s.slug, s);
  const all = [...bySlug.values()];
  return opts.admin ? all : all.filter((s) => s.published);
}

export async function getUnifiedSongBySlug(
  slug: string,
  opts: { admin: boolean },
): Promise<CatalogEntry | null> {
  const fileSong = getCatalogSongBySlug(slug, opts);
  if (fileSong) return fileSong;
  const published = await listPublishedVersions();
  return published.find((s) => s.slug === slug) ?? null;
}
