import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { versionVotes } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({ direction: z.union([z.literal(1), z.literal(-1)]) }).strict();

export async function POST(req: Request, { params }: Params): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return jsonNoStore({ error: 'Voto inválido.' }, { status: 400 });
  try {
    const [existing] = await db
      .select()
      .from(versionVotes)
      .where(and(eq(versionVotes.versionId, id), eq(versionVotes.userId, user.id)))
      .limit(1);
    if (existing) {
      await db
        .update(versionVotes)
        .set({ direction: parsed.data.direction })
        .where(eq(versionVotes.id, existing.id));
    } else {
      await db.insert(versionVotes).values({
        versionId: id,
        userId: user.id,
        direction: parsed.data.direction,
      });
    }
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ error: 'Não foi possível votar.' }, { status: 503 });
  }
}
