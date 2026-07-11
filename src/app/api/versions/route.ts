import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';
import { parseSongPayload } from '@/lib/security/song-schema';
import { normalizeText, versionSlug, workSlug } from '@/lib/songs/normalize';
import type { Song } from '@/types/song/song.types';

const submitSchema = z
  .object({
    artist: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(160),
    label: z.string().trim().max(80).optional(),
    song: z.unknown(),
    intent: z.enum(['new_version', 'edit_own']).default('new_version'),
    versionId: z.string().optional(),
  })
  .strict();

/** POST — envia versão para moderação (nunca publica). */
export async function POST(req: Request): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  const limited = await rateLimitCheck(clientKey(req, `submit:${user.id}`), RATE.submit);
  if (!limited.ok) {
    return jsonNoStore(
      { error: 'Limite de envios atingido. Tente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados incompletos para envio.' }, { status: 400 });
  }

  const { artist, title, label, intent, versionId } = parsed.data;
  const songParsed = parseSongPayload(parsed.data.song);
  if (!songParsed.ok) {
    return jsonNoStore(
      { error: 'Cifra inválida: precisa de título, seções e pelo menos um acorde.' },
      { status: 400 },
    );
  }
  const song = songParsed.song;

  if (JSON.stringify(song).length > 200_000) {
    return jsonNoStore({ error: 'Cifra grande demais.' }, { status: 413 });
  }

  const normalizedArtist = normalizeText(artist);
  const normalizedTitle = normalizeText(title);

  let work = (
    await db
      .select()
      .from(works)
      .where(
        and(
          eq(works.normalizedArtist, normalizedArtist),
          eq(works.normalizedTitle, normalizedTitle),
        ),
      )
      .limit(1)
  )[0];

  if (!work) {
    let slug = workSlug(artist, title);
    const [clash] = await db
      .select({ id: works.id })
      .from(works)
      .where(eq(works.slug, slug))
      .limit(1);
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    [work] = await db
      .insert(works)
      .values({ artist, title, normalizedArtist, normalizedTitle, slug })
      .returning();
  }

  if (intent === 'edit_own' && versionId) {
    const [existing] = await db
      .select()
      .from(songVersions)
      .where(eq(songVersions.id, versionId))
      .limit(1);
    if (!existing || existing.authorId !== user.id) {
      return jsonNoStore(
        { error: 'Você só pode editar versões das quais é autor. Envie uma nova versão.' },
        { status: 403 },
      );
    }
    const payload: Song = {
      ...song,
      title,
      artist,
      slug: existing.slug,
      published: false,
      source: 'user',
    };
    const [updated] = await db
      .update(songVersions)
      .set({
        payload,
        status: 'pending_review',
        label: label || existing.label,
        rejectionReason: null,
        rejectionCategory: null,
        publishedAt: null,
        revisionCount: (existing.revisionCount ?? 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(songVersions.id, existing.id))
      .returning();
    return jsonNoStore({
      ok: true,
      id: updated.id,
      slug: updated.slug,
      status: updated.status,
      message: 'Versão reenviada para revisão do admin. Não está pública até nova aprovação.',
    });
  }

  const slug = versionSlug(artist, title, label || user.id.slice(0, 6));
  const payload: Song = {
    ...song,
    id: song.id || crypto.randomUUID(),
    title,
    artist,
    slug,
    published: false,
    source: 'user',
  };

  const [created] = await db
    .insert(songVersions)
    .values({
      workId: work.id,
      slug,
      status: 'pending_review',
      label: label || null,
      authorId: user.id,
      payload,
    })
    .returning();

  return jsonNoStore(
    {
      ok: true,
      id: created.id,
      slug: created.slug,
      status: created.status,
      workId: work.id,
      message: 'Cifra enviada. Aguardando revisão do admin; ainda não está pública.',
    },
    { status: 201 },
  );
}

/** GET — minhas versões (autenticado). */
export async function GET(): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  const rows = await db
    .select({
      id: songVersions.id,
      slug: songVersions.slug,
      status: songVersions.status,
      label: songVersions.label,
      rejectionReason: songVersions.rejectionReason,
      rejectionCategory: songVersions.rejectionCategory,
      createdAt: songVersions.createdAt,
      publishedAt: songVersions.publishedAt,
      workTitle: works.title,
      workArtist: works.artist,
    })
    .from(songVersions)
    .innerJoin(works, eq(songVersions.workId, works.id))
    .where(eq(songVersions.authorId, user.id))
    .orderBy(desc(songVersions.createdAt))
    .limit(50);

  return jsonNoStore({ versions: rows });
}
