import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { songViews } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';

const postSchema = z.object({ songSlug: z.string().min(1).max(120) }).strict();

export async function GET(): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  try {
    const rows = await db
      .select()
      .from(songViews)
      .where(eq(songViews.userId, user.id))
      .orderBy(desc(songViews.createdAt))
      .limit(100);
    return jsonNoStore({ history: rows });
  } catch {
    return jsonNoStore({ history: [] });
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
  if (!parsed.success) return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  try {
    await db.insert(songViews).values({ songSlug: parsed.data.songSlug, userId: user.id });
    return jsonNoStore({ ok: true }, { status: 201 });
  } catch {
    return jsonNoStore({ ok: true, note: 'view não persistida' });
  }
}
