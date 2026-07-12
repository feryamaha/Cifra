import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { userFavorites } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';

const postSchema = z
  .object({
    songSlug: z.string().min(1).max(120),
    collectionId: z.string().optional().nullable(),
  })
  .strict();

export async function GET(): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  try {
    const rows = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, user.id))
      .orderBy(desc(userFavorites.createdAt))
      .limit(100);
    return jsonNoStore({ favorites: rows });
  } catch {
    return jsonNoStore({ favorites: [], note: 'Tabela ainda não migrada (db:push).' });
  }
}

export async function POST(req: Request): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  try {
    // Idempotente: refavoritar não é erro (índice único user_id+song_slug)
    const [row] = await db
      .insert(userFavorites)
      .values({
        userId: user.id,
        songSlug: parsed.data.songSlug,
        collectionId: parsed.data.collectionId ?? null,
      })
      .onConflictDoNothing()
      .returning();
    return jsonNoStore({ ok: true, favorite: row ?? null }, { status: 201 });
  } catch {
    return jsonNoStore(
      { error: 'Não foi possível salvar. Rode db:push se necessário.' },
      { status: 503 },
    );
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  const slug = new URL(req.url).searchParams.get('songSlug')?.slice(0, 120);
  if (!slug) return jsonNoStore({ error: 'Informe songSlug.' }, { status: 400 });
  try {
    await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, user.id), eq(userFavorites.songSlug, slug)));
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ error: 'Falha ao remover.' }, { status: 503 });
  }
}
