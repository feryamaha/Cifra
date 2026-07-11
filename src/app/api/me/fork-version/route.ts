/**
 * SPEC_006 B5 — correção colaborativa: cria nova versão pending_review
 * a partir de payload do usuário (fork), sem publicar.
 */

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { parseSongPayload } from '@/lib/security/song-schema';
import { versionSlug } from '@/lib/songs/normalize';

const bodySchema = z
  .object({
    baseVersionId: z.string().optional(),
    workId: z.string().optional(),
    artist: z.string().min(1).max(120),
    title: z.string().min(1).max(160),
    label: z.string().max(80).optional(),
    song: z.unknown(),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });

  const songParsed = parseSongPayload(parsed.data.song);
  if (!songParsed.ok) {
    return jsonNoStore({ error: 'Cifra inválida.' }, { status: 400 });
  }

  try {
    let workId = parsed.data.workId;
    if (!workId) {
      const [w] = await db
        .insert(works)
        .values({
          artist: parsed.data.artist,
          title: parsed.data.title,
          normalizedArtist: parsed.data.artist.toLowerCase(),
          normalizedTitle: parsed.data.title.toLowerCase(),
          slug: versionSlug(parsed.data.artist, parsed.data.title, 'work').slice(0, 100),
        })
        .returning({ id: works.id });
      workId = w.id;
    } else {
      const [exists] = await db
        .select({ id: works.id })
        .from(works)
        .where(eq(works.id, workId))
        .limit(1);
      if (!exists) return jsonNoStore({ error: 'Obra não encontrada.' }, { status: 404 });
    }

    const slug = versionSlug(
      parsed.data.artist,
      parsed.data.title,
      parsed.data.label || `fork-${user.id.slice(0, 6)}`,
    );
    const payload = {
      ...songParsed.song,
      title: parsed.data.title,
      artist: parsed.data.artist,
      slug,
      published: false,
      source: 'user' as const,
    };
    const [created] = await db
      .insert(songVersions)
      .values({
        workId,
        slug,
        status: 'pending_review',
        label: parsed.data.label || 'Correção colaborativa',
        authorId: user.id,
        payload,
      })
      .returning({ id: songVersions.id, slug: songVersions.slug });

    return jsonNoStore(
      {
        ok: true,
        id: created.id,
        slug: created.slug,
        message: 'Fork enviado para moderação.',
      },
      { status: 201 },
    );
  } catch {
    return jsonNoStore({ error: 'Não foi possível criar o fork.' }, { status: 503 });
  }
}
