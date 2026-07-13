import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { moderationEvents, songVersions, users } from '@/lib/db/schema';
import { REJECTION_CATEGORY_LABELS } from '@/lib/moderation/labels';
import { jsonNoStore } from '@/lib/security/http-headers';
import { notifyUser } from '@/lib/security/notify-user';
import { sanitizePlainText, stripHtml } from '@/lib/security/sanitize';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';
import { revalidateSongContent } from '@/lib/songs/revalidate';

const rejectSchema = z
  .object({
    action: z.literal('reject'),
    category: z.enum(['duplication', 'typos', 'technical_error', 'copyright', 'edit_required']),
    reason: z.string().trim().min(5).max(2000),
  })
  .strict();

const approveSchema = z
  .object({
    action: z.literal('approve'),
  })
  .strict();

const bodySchema = z.discriminatedUnion('action', [approveSchema, rejectSchema]);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();

  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success && !/^[a-zA-Z0-9_-]{8,80}$/.test(id)) {
    return jsonNoStore({ error: 'ID inválido.' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados de moderação inválidos.' }, { status: 400 });
  }

  const [version] = await db.select().from(songVersions).where(eq(songVersions.id, id)).limit(1);
  if (!version) {
    return jsonNoStore({ error: 'Versão não encontrada.' }, { status: 404 });
  }

  if (parsed.data.action === 'approve') {
    const [updated] = await db
      .update(songVersions)
      .set({
        status: 'published',
        rejectionReason: null,
        rejectionCategory: null,
        publishedAt: new Date(),
        updatedAt: new Date(),
        payload: { ...version.payload, published: true, slug: version.slug },
      })
      .where(eq(songVersions.id, id))
      .returning();

    await db.insert(moderationEvents).values({
      versionId: id,
      action: 'approve',
    });

    if (version.authorId) {
      const [author] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, version.authorId))
        .limit(1);
      await notifyUser({
        userId: version.authorId,
        email: author?.email,
        type: 'version_published',
        title: 'Cifra publicada',
        body: `Sua cifra "${version.payload.title}" foi aprovada e está no catálogo.`,
        versionId: id,
      });
    }

    // ISR (SPEC_012 A4): cifra aprovada aparece na hora
    revalidateSongContent(version.slug);
    return jsonNoStore({ ok: true, version: { id: updated.id, status: updated.status } });
  }

  const reason = sanitizePlainText(stripHtml(parsed.data.reason), 2000);
  const category = parsed.data.category;
  const catLabel = REJECTION_CATEGORY_LABELS[category] ?? category;

  const [updated] = await db
    .update(songVersions)
    .set({
      status: 'rejected',
      rejectionReason: reason,
      rejectionCategory: category,
      updatedAt: new Date(),
      publishedAt: null,
      payload: { ...version.payload, published: false },
    })
    .where(eq(songVersions.id, id))
    .returning();

  await db.insert(moderationEvents).values({
    versionId: id,
    action: 'reject',
    reason,
    category,
  });

  if (version.authorId) {
    const [author] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, version.authorId))
      .limit(1);
    await notifyUser({
      userId: version.authorId,
      email: author?.email,
      type: 'version_rejected',
      title: 'Cifra não publicada',
      body: `Categoria: ${catLabel}\n\n${reason}\n\nVocê pode editar e reenviar, ou responder/argumentar no painel Meus envios.`,
      versionId: id,
      meta: { category, categoryLabel: catLabel },
    });
  }

  // ISR (SPEC_012 A4): rejeição também tira do ar imediatamente se estava pública
  revalidateSongContent(version.slug);
  return jsonNoStore({ ok: true, version: { id: updated.id, status: updated.status } });
}
