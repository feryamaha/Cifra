/**
 * GET — cifra publicada por slug (para formulário de edição colaborativa).
 * Só status published; sem dados de admin/autor sensíveis além do payload público.
 */

import { jsonNoStore } from '@/lib/security/http-headers';
import { getUnifiedSongBySlug } from '@/lib/songs/server-catalog';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  const { slug } = await params;
  if (!slug || slug.length > 160) {
    return jsonNoStore({ error: 'Slug inválido.' }, { status: 400 });
  }
  const song = await getUnifiedSongBySlug(slug, { admin: false });
  if (!song) {
    return jsonNoStore({ error: 'Cifra não encontrada.' }, { status: 404 });
  }
  return jsonNoStore({ song });
}
