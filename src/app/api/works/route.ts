import { and, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import { normalizeText, workSlug } from '@/lib/songs/normalize';

/** GET ?q= — busca pública enxuta (sem authorId / id interno). */
export async function GET(req: Request): Promise<Response> {
  const raw = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  const q = raw.slice(0, 120);
  if (q.length < 2) {
    return Response.json({ works: [] });
  }

  const like = `%${q}%`;
  const found = await db
    .select({
      id: works.id,
      slug: works.slug,
      artist: works.artist,
      title: works.title,
    })
    .from(works)
    .where(or(ilike(works.title, like), ilike(works.artist, like), ilike(works.slug, like)))
    .limit(12);

  const enriched = await Promise.all(
    found.map(async (work) => {
      const versions = await db
        .select({
          slug: songVersions.slug,
          label: songVersions.label,
        })
        .from(songVersions)
        .where(and(eq(songVersions.workId, work.id), eq(songVersions.status, 'published')))
        .limit(20);
      return {
        slug: work.slug,
        artist: work.artist,
        title: work.title,
        versions,
      };
    }),
  );

  return Response.json({ works: enriched });
}

const createSchema = z.object({
  artist: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(160),
});

/** POST — garante obra (autenticado). */
export async function POST(req: Request): Promise<Response> {
  const { error } = await requireUser();
  if (error) return error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'Informe artista e título.' }, { status: 400 });
  }

  const artist = parsed.data.artist.trim();
  const title = parsed.data.title.trim();
  const normalizedArtist = normalizeText(artist);
  const normalizedTitle = normalizeText(title);

  const [existing] = await db
    .select({
      slug: works.slug,
      artist: works.artist,
      title: works.title,
    })
    .from(works)
    .where(
      and(eq(works.normalizedArtist, normalizedArtist), eq(works.normalizedTitle, normalizedTitle)),
    )
    .limit(1);

  if (existing) {
    return Response.json({ work: existing, created: false });
  }

  let slug = workSlug(artist, title);
  const [slugClash] = await db
    .select({ id: works.id })
    .from(works)
    .where(eq(works.slug, slug))
    .limit(1);
  if (slugClash) slug = `${slug}-${Date.now().toString(36)}`;

  const [created] = await db
    .insert(works)
    .values({ artist, title, normalizedArtist, normalizedTitle, slug })
    .returning({
      slug: works.slug,
      artist: works.artist,
      title: works.title,
    });

  return Response.json({ work: created, created: true }, { status: 201 });
}
