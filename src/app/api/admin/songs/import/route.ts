import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { moderationEvents, songVersions, works } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';
import { parseSongPayload } from '@/lib/security/song-schema';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';
import { normalizeText, versionSlug, workSlug } from '@/lib/songs/normalize';

/**
 * Importação em lote (SPEC_010 B1/B4/E3): SOMENTE admin.
 * Até 20 cifras por requisição; cada item validado com o mesmo schema Zod
 * das submissões; publica direto (admin é o moderador) e registra
 * moderation_events para auditoria. Falha de um item não derruba o lote.
 */

const MAX_ITEMS = 20;
const MAX_BODY_BYTES = 2_000_000; // 2MB por lote (E3)
const MAX_ITEM_BYTES = 200_000; // mesmo teto das submissões

const itemSchema = z
  .object({
    artist: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(160),
    label: z.string().trim().max(80).optional(),
    song: z.unknown(),
  })
  .strict();

const importSchema = z.object({ items: z.array(itemSchema).min(1).max(MAX_ITEMS) }).strict();

export interface ImportItemResult {
  index: number;
  title: string;
  ok: boolean;
  slug?: string;
  error?: string;
}

export async function POST(req: Request): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();

  const limited = await rateLimitCheck(clientKey(req, 'admin-import'), RATE.admin);
  if (!limited.ok) {
    return jsonNoStore(
      { error: 'Limite de importações atingido. Tente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonNoStore({ error: 'Lote grande demais (máx. 2MB).' }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = importSchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore(
      { error: `Lote inválido: envie de 1 a ${MAX_ITEMS} itens com artista, título e cifra.` },
      { status: 400 },
    );
  }

  const results: ImportItemResult[] = [];

  for (const [index, item] of parsed.data.items.entries()) {
    // NFC na escrita (SPEC_010 A8)
    const artist = item.artist.normalize('NFC');
    const title = item.title.normalize('NFC');
    try {
      const songParsed = parseSongPayload(item.song);
      if (!songParsed.ok) {
        results.push({
          index,
          title,
          ok: false,
          error: 'Cifra inválida: precisa de título, seções e pelo menos um acorde.',
        });
        continue;
      }
      if (JSON.stringify(songParsed.song).length > MAX_ITEM_BYTES) {
        results.push({ index, title, ok: false, error: 'Cifra grande demais.' });
        continue;
      }

      const normalizedArtist = normalizeText(artist);
      const normalizedTitle = normalizeText(title);

      let work = (
        await db
          .select()
          .from(works)
          .where(
            and(
              eq(works.normalizedArtist, normalizedArtist),
              eq(works.normalizedTitle, normalizedTitle),
            ),
          )
          .limit(1)
      )[0];

      if (!work) {
        let slug = workSlug(artist, title);
        const [clash] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
        if (clash) slug = `${slug}-${Date.now().toString(36)}`.slice(0, 120);
        [work] = await db
          .insert(works)
          .values({ artist, title, normalizedArtist, normalizedTitle, slug })
          .returning();
      }

      const slug = versionSlug(artist, title);
      const now = new Date();
      const [version] = await db
        .insert(songVersions)
        .values({
          workId: work.id,
          slug,
          status: 'published',
          label: item.label?.normalize('NFC') ?? 'Importação em lote',
          authorId: null,
          payload: { ...songParsed.song, slug, title, artist },
          publishedAt: now,
          updatedAt: now,
        })
        .returning();

      // Auditoria (B4): import é uma aprovação direta do admin
      await db.insert(moderationEvents).values({
        versionId: version.id,
        adminId: null,
        action: 'approve',
        reason: 'Importação em lote (admin)',
      });

      results.push({ index, title, ok: true, slug });
    } catch {
      results.push({ index, title, ok: false, error: 'Falha ao gravar no banco.' });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  return jsonNoStore({ results, okCount, failCount: results.length - okCount });
}
