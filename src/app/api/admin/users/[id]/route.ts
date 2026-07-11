import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { notifyUser } from '@/lib/security/notify-user';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';
import { sanitizePlainText, stripHtml } from '@/lib/security/sanitize';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

const patchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('block') }),
  z.object({ action: z.literal('unblock') }),
  z.object({
    action: z.literal('notify'),
    title: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(2000),
  }),
]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();

  const limited = await rateLimitCheck(clientKey(req, 'admin-users'), RATE.submit);
  if (!limited.ok) {
    return jsonNoStore({ error: 'Muitas tentativas.' }, { status: 429 });
  }

  const { id } = await ctx.params;
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

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      blocked: users.blocked,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user || user.deletedAt) {
    return jsonNoStore({ error: 'Usuário não encontrado.' }, { status: 404 });
  }

  if (parsed.data.action === 'block') {
    await db.update(users).set({ blocked: true }).where(eq(users.id, id));
    return jsonNoStore({ ok: true, blocked: true });
  }

  if (parsed.data.action === 'unblock') {
    await db.update(users).set({ blocked: false }).where(eq(users.id, id));
    return jsonNoStore({ ok: true, blocked: false });
  }

  const title = sanitizePlainText(stripHtml(parsed.data.title), 120);
  const body = sanitizePlainText(stripHtml(parsed.data.body), 2000);
  await notifyUser({
    userId: user.id,
    email: user.email,
    type: 'admin_message',
    title,
    body,
  });
  return jsonNoStore({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { id } = await ctx.params;

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
  if (!user) return jsonNoStore({ error: 'Usuário não encontrado.' }, { status: 404 });

  // Soft-delete: bloqueia e marca deletedAt; ofusca e-mail preservando prefixo de auditoria
  const [row] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  const obfuscated = row?.email
    ? `deleted.${id.slice(0, 8)}.${row.email.replace(/@/, '_at_')}@invalid.local`.slice(0, 160)
    : `deleted.${id.slice(0, 8)}@invalid.local`;

  await db
    .update(users)
    .set({ deletedAt: new Date(), blocked: true, email: obfuscated })
    .where(eq(users.id, id));

  return jsonNoStore({ ok: true });
}
