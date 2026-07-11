import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { songComments, users } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { sanitizePlainText, stripHtml } from '@/lib/security/sanitize';

type Params = { params: Promise<{ slug: string }> };

const postSchema = z.object({ text: z.string().trim().min(2).max(2000) }).strict();

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  const { slug } = await params;
  try {
    const rows = await db
      .select({
        id: songComments.id,
        text: songComments.text,
        createdAt: songComments.createdAt,
        userName: users.name,
      })
      .from(songComments)
      .leftJoin(users, eq(songComments.userId, users.id))
      .where(and(eq(songComments.songSlug, slug), eq(songComments.status, 'published')))
      .orderBy(desc(songComments.createdAt))
      .limit(50);
    return Response.json({ comments: rows });
  } catch {
    return Response.json({ comments: [] });
  }
}

export async function POST(req: Request, { params }: Params): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;
  const { slug } = await params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return jsonNoStore({ error: 'Comentário inválido.' }, { status: 400 });
  const text = sanitizePlainText(stripHtml(parsed.data.text), 2000);
  try {
    const [row] = await db
      .insert(songComments)
      .values({ songSlug: slug, userId: user.id, text, status: 'pending' })
      .returning({ id: songComments.id, status: songComments.status });
    return jsonNoStore(
      { ok: true, comment: row, message: 'Comentário enviado para moderação.' },
      { status: 201 },
    );
  } catch {
    return jsonNoStore({ error: 'Não foi possível enviar.' }, { status: 503 });
  }
}
