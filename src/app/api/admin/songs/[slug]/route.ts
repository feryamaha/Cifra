import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { parseSongPayload } from '@/lib/security/song-schema';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';
import { revalidateSongContent } from '@/lib/songs/revalidate';
import type { Song } from '@/types/song/song.types';

type Params = { params: Promise<{ slug: string }> };

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);

const putSchema = z
  .object({
    song: z.unknown().optional(),
    published: z.boolean().optional(),
  })
  .strict();

/** Versão do catálogo (qualquer status) por slug, direto no Neon (SPEC_010 A1/A2). */
async function findVersionBySlug(slug: string) {
  const rows = await db
    .select({ version: songVersions, work: works })
    .from(songVersions)
    .innerJoin(works, eq(songVersions.workId, works.id))
    .where(eq(songVersions.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

function toAdminSong(row: NonNullable<Awaited<ReturnType<typeof findVersionBySlug>>>) {
  const payload = row.version.payload as Song;
  return {
    ...payload,
    id: row.version.id,
    slug: row.version.slug,
    title: row.work.title.normalize('NFC'),
    artist: row.work.artist.normalize('NFC'),
    published: row.version.status === 'published',
  };
}

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { slug: raw } = await params;
  const slugParsed = slugSchema.safeParse(raw);
  if (!slugParsed.success) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const row = await findVersionBySlug(slugParsed.data);
  if (!row) return jsonNoStore({ error: 'Música não encontrada.' }, { status: 404 });
  return jsonNoStore({ song: toAdminSong(row) });
}

export async function PUT(req: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { slug: raw } = await params;
  const slugParsed = slugSchema.safeParse(raw);
  if (!slugParsed.success) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const slug = slugParsed.data;

  const existing = await findVersionBySlug(slug);
  if (!existing) return jsonNoStore({ error: 'Música não encontrada.' }, { status: 404 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  }

  if (parsed.data.song !== undefined) {
    const rawSong = parsed.data.song;
    const candidate =
      typeof rawSong === 'object' && rawSong !== null ? { ...rawSong, slug } : rawSong;
    const songParsed = parseSongPayload(candidate);
    if (!songParsed.ok) {
      return jsonNoStore(
        { error: 'Música inválida: precisa de título, seções e pelo menos um acorde.' },
        { status: 400 },
      );
    }
    await db
      .update(songVersions)
      .set({ payload: { ...songParsed.song, slug }, updatedAt: new Date() })
      .where(eq(songVersions.id, existing.version.id));
  }

  if (typeof parsed.data.published === 'boolean') {
    await db
      .update(songVersions)
      .set({
        status: parsed.data.published ? 'published' : 'draft',
        publishedAt: parsed.data.published ? (existing.version.publishedAt ?? new Date()) : null,
        updatedAt: new Date(),
      })
      .where(eq(songVersions.id, existing.version.id));
  }

  // ISR (SPEC_012 A4)
  revalidateSongContent(slug);
  const updated = await findVersionBySlug(slug);
  return jsonNoStore({ song: updated ? toAdminSong(updated) : null });
}

export async function DELETE(_req: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { slug: raw } = await params;
  const slugParsed = slugSchema.safeParse(raw);
  if (!slugParsed.success) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const existing = await findVersionBySlug(slugParsed.data);
  if (!existing) return jsonNoStore({ error: 'Música não encontrada.' }, { status: 404 });
  await db.delete(songVersions).where(eq(songVersions.id, existing.version.id));
  // ISR (SPEC_012 A4)
  revalidateSongContent(slugParsed.data);
  return jsonNoStore({ ok: true });
}
