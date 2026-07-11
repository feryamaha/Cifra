import { z } from 'zod';
import { jsonNoStore } from '@/lib/security/http-headers';
import { parseSongPayload } from '@/lib/security/song-schema';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';
import { getCatalogSongBySlug, saveOverride } from '@/lib/server/song-store';

type Params = { params: Promise<{ slug: string }> };

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);

const putSchema = z
  .object({
    song: z.unknown().optional(),
    published: z.boolean().optional(),
  })
  .strict();

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { slug: raw } = await params;
  const slugParsed = slugSchema.safeParse(raw);
  if (!slugParsed.success) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const song = getCatalogSongBySlug(slugParsed.data, { admin: true });
  if (!song) return jsonNoStore({ error: 'Música não encontrada.' }, { status: 404 });
  return jsonNoStore({ song });
}

export async function PUT(req: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { slug: raw } = await params;
  const slugParsed = slugSchema.safeParse(raw);
  if (!slugParsed.success) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const slug = slugParsed.data;

  const existing = getCatalogSongBySlug(slug, { admin: true });
  if (!existing) return jsonNoStore({ error: 'Música não encontrada.' }, { status: 404 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  }

  if (parsed.data.song !== undefined) {
    const raw = parsed.data.song;
    const candidate = typeof raw === 'object' && raw !== null ? { ...raw, slug } : raw;
    const songParsed = parseSongPayload(candidate);
    if (!songParsed.ok) {
      return jsonNoStore(
        { error: 'Música inválida: precisa de título, seções e pelo menos um acorde.' },
        { status: 400 },
      );
    }
    saveOverride(slug, { song: { ...songParsed.song, slug } });
  }
  if (typeof parsed.data.published === 'boolean') {
    saveOverride(slug, { published: parsed.data.published });
  }

  return jsonNoStore({ song: getCatalogSongBySlug(slug, { admin: true }) });
}

export async function DELETE(_req: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  const { slug: raw } = await params;
  const slugParsed = slugSchema.safeParse(raw);
  if (!slugParsed.success) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const slug = slugParsed.data;
  const existing = getCatalogSongBySlug(slug, { admin: true });
  if (!existing) return jsonNoStore({ error: 'Música não encontrada.' }, { status: 404 });
  saveOverride(slug, { deleted: true, song: undefined, published: undefined });
  return jsonNoStore({ ok: true });
}
