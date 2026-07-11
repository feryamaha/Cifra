import { z } from 'zod';
import { getUnifiedSongBySlug } from '@/lib/songs/server-catalog';

const qSchema = z.object({
  slug: z.string().min(1).max(120),
  format: z.enum(['txt', 'json']).default('txt'),
});

/** Export público TXT/JSON da cifra (SPEC_006 C7). PDF = print no client. */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = qSchema.safeParse({
    slug: url.searchParams.get('slug') ?? '',
    format: url.searchParams.get('format') ?? 'txt',
  });
  if (!parsed.success) {
    return Response.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  }
  const song = await getUnifiedSongBySlug(parsed.data.slug, { admin: false });
  if (!song) return Response.json({ error: 'Não encontrada.' }, { status: 404 });

  if (parsed.data.format === 'json') {
    return Response.json({ song });
  }

  const lines = [
    song.title,
    song.artist,
    `Tom: ${song.originalKey} | ${song.timeSignature}${song.bpm ? ` | BPM ${song.bpm}` : ''}`,
    '',
  ];
  for (const sec of song.sections) {
    lines.push(`[${sec.tag}] ${sec.name}`);
    for (const line of sec.lines) {
      lines.push(line.parts.map((p) => p.chord || '').join('  '));
      lines.push(line.parts.map((p) => p.text).join(''));
    }
    lines.push('');
  }
  const body = lines.join('\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${song.slug}.txt"`,
    },
  });
}
