import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { userCollections } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';

const postSchema = z.object({ name: z.string().trim().min(1).max(80) }).strict();

export async function GET(): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  try {
    const rows = await db
      .select()
      .from(userCollections)
      .where(eq(userCollections.userId, user.id))
      .orderBy(desc(userCollections.createdAt));
    return jsonNoStore({ collections: rows });
  } catch {
    return jsonNoStore({ collections: [] });
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
  if (!parsed.success) return jsonNoStore({ error: 'Nome inválido.' }, { status: 400 });
  try {
    const [row] = await db
      .insert(userCollections)
      .values({ userId: user.id, name: parsed.data.name })
      .returning();
    return jsonNoStore({ ok: true, collection: row }, { status: 201 });
  } catch {
    return jsonNoStore({ error: 'Não foi possível criar coleção.' }, { status: 503 });
  }
}
