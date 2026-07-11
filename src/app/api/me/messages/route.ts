import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { adminInboxMessages, users } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';
import { sanitizePlainText, stripHtml } from '@/lib/security/sanitize';

const postSchema = z.object({
  subject: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
  relatedVersionId: z.string().optional(),
  kind: z.enum(['general', 'rejection_appeal']).default('general'),
});

export async function POST(req: Request): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  const limited = await rateLimitCheck(clientKey(req, `msg:${user.id}`), RATE.submit);
  if (!limited.ok) {
    return jsonNoStore({ error: 'Limite de mensagens atingido.' }, { status: 429 });
  }

  // bloqueio
  const [row] = await db
    .select({ blocked: users.blocked, deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (row?.blocked || row?.deletedAt) {
    return jsonNoStore({ error: 'Conta indisponível.' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const [created] = await db
    .insert(adminInboxMessages)
    .values({
      fromUserId: user.id,
      subject: sanitizePlainText(stripHtml(parsed.data.subject), 120),
      body: sanitizePlainText(stripHtml(parsed.data.body), 2000),
      relatedVersionId: parsed.data.relatedVersionId ?? null,
      kind: parsed.data.kind,
    })
    .returning({ id: adminInboxMessages.id });

  return jsonNoStore({ ok: true, id: created.id }, { status: 201 });
}
