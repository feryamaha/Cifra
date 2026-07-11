import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { adminInboxMessages, users } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();

  const rows = await db
    .select({
      id: adminInboxMessages.id,
      subject: adminInboxMessages.subject,
      body: adminInboxMessages.body,
      kind: adminInboxMessages.kind,
      read: adminInboxMessages.read,
      createdAt: adminInboxMessages.createdAt,
      relatedVersionId: adminInboxMessages.relatedVersionId,
      fromUserId: adminInboxMessages.fromUserId,
      fromName: users.name,
      fromEmail: users.email,
    })
    .from(adminInboxMessages)
    .innerJoin(users, eq(adminInboxMessages.fromUserId, users.id))
    .orderBy(desc(adminInboxMessages.createdAt))
    .limit(100);

  return jsonNoStore({ messages: rows });
}

const patchSchema = z.object({
  id: z.string().min(1),
  read: z.boolean(),
});

export async function PATCH(req: Request): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
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
  await db
    .update(adminInboxMessages)
    .set({ read: parsed.data.read })
    .where(eq(adminInboxMessages.id, parsed.data.id));
  return jsonNoStore({ ok: true });
}
