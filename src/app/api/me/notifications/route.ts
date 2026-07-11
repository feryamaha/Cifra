import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { userNotifications } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';

const patchSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  all: z.boolean().optional(),
});

export async function GET(): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  const rows = await db
    .select({
      id: userNotifications.id,
      type: userNotifications.type,
      title: userNotifications.title,
      body: userNotifications.body,
      versionId: userNotifications.versionId,
      meta: userNotifications.meta,
      read: userNotifications.read,
      createdAt: userNotifications.createdAt,
    })
    .from(userNotifications)
    .where(eq(userNotifications.userId, user.id))
    .orderBy(desc(userNotifications.createdAt))
    .limit(40);

  return jsonNoStore({ notifications: rows });
}

export async function PATCH(req: Request): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  }

  if (parsed.data.all) {
    await db
      .update(userNotifications)
      .set({ read: true })
      .where(eq(userNotifications.userId, user.id));
    return jsonNoStore({ ok: true });
  }

  const id = parsed.data.id;
  if (!id) {
    return jsonNoStore({ error: 'Informe o id.' }, { status: 400 });
  }

  // Ownership obrigatório — evita IDOR (SECURITY_SCAN E2)
  const result = await db
    .update(userNotifications)
    .set({ read: true })
    .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, user.id)))
    .returning({ id: userNotifications.id });

  if (result.length === 0) {
    return jsonNoStore({ error: 'Notificação não encontrada.' }, { status: 404 });
  }

  return jsonNoStore({ ok: true });
}
