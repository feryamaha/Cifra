import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { songVersions, works } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';

/** GET — payload da versão do próprio autor (para edição). */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await ctx.params;
  const [row] = await db
    .select({
      id: songVersions.id,
      slug: songVersions.slug,
      status: songVersions.status,
      label: songVersions.label,
      payload: songVersions.payload,
      rejectionReason: songVersions.rejectionReason,
      rejectionCategory: songVersions.rejectionCategory,
      workTitle: works.title,
      workArtist: works.artist,
    })
    .from(songVersions)
    .innerJoin(works, eq(songVersions.workId, works.id))
    .where(and(eq(songVersions.id, id), eq(songVersions.authorId, user.id)))
    .limit(1);

  if (!row) {
    return jsonNoStore({ error: 'Versão não encontrada.' }, { status: 404 });
  }

  return jsonNoStore({ version: row });
}
