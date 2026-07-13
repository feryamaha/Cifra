import { desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { songViews } from '@/lib/db/schema';
import { getUnifiedCatalog } from '@/lib/songs/server-catalog';

/** Ranking público por contagem de song_views (SPEC_006 A7). */
// Cache de 120s (SPEC_012 A3): alivia o Neon; rota não usa cookies/sessão.
export const revalidate = 120;

export async function GET(): Promise<Response> {
  try {
    const counts = await db
      .select({
        songSlug: songViews.songSlug,
        views: sql<number>`count(*)::int`,
      })
      .from(songViews)
      .groupBy(songViews.songSlug)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const catalog = await getUnifiedCatalog({ admin: false });
    const bySlug = new Map(catalog.map((s) => [s.slug, s]));
    const trending = counts
      .map((c) => {
        const song = bySlug.get(c.songSlug);
        if (!song) return null;
        return {
          slug: song.slug,
          title: song.title,
          artist: song.artist,
          views: c.views,
        };
      })
      .filter(Boolean);

    if (trending.length === 0) {
      return Response.json({
        trending: catalog.slice(0, 10).map((s) => ({
          slug: s.slug,
          title: s.title,
          artist: s.artist,
          views: 0,
        })),
      });
    }
    return Response.json({ trending });
  } catch {
    const catalog = await getUnifiedCatalog({ admin: false });
    return Response.json({
      trending: catalog.slice(0, 10).map((s) => ({
        slug: s.slug,
        title: s.title,
        artist: s.artist,
        views: 0,
      })),
    });
  }
}
