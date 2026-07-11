import { getUnifiedCatalog } from '@/lib/songs/server-catalog';

/** SPEC_006 B7 — "quem viu também viu": mesmo artista ou gênero */
export async function GET(req: Request): Promise<Response> {
  const slug = new URL(req.url).searchParams.get('slug')?.slice(0, 120);
  if (!slug) return Response.json({ related: [] });
  const catalog = await getUnifiedCatalog({ admin: false });
  const base = catalog.find((s) => s.slug === slug);
  if (!base) return Response.json({ related: [] });
  const related = catalog
    .filter((s) => s.slug !== slug && (s.artist === base.artist || s.genre === base.genre))
    .slice(0, 8)
    .map((s) => ({ slug: s.slug, title: s.title, artist: s.artist }));
  return Response.json({ related });
}
