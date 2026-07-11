import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { songComments, users } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

const patchSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(['published', 'rejected', 'pending']),
  })
  .strict();

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  try {
    const rows = await db
      .select({
        id: songComments.id,
        songSlug: songComments.songSlug,
        text: songComments.text,
        status: songComments.status,
        createdAt: songComments.createdAt,
        userEmail: users.email,
      })
      .from(songComments)
      .leftJoin(users, eq(songComments.userId, users.id))
      .orderBy(desc(songComments.createdAt))
      .limit(100);
    return jsonNoStore({ comments: rows });
  } catch {
    return jsonNoStore({ comments: [] });
  }
}

export async function PATCH(req: Request): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  try {
    await db
      .update(songComments)
      .set({ status: parsed.data.status })
      .where(eq(songComments.id, parsed.data.id));
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ error: 'Falha ao atualizar.' }, { status: 503 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return jsonNoStore({ error: 'ID obrigatório.' }, { status: 400 });
  try {
    await db.delete(songComments).where(eq(songComments.id, id));
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ error: 'Falha ao excluir.' }, { status: 503 });
  }
}
