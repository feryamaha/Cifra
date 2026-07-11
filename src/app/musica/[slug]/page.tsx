import { notFound } from 'next/navigation';
import { SongPageClient } from '@/components/song/SongPageClient';
import { getUnifiedSongBySlug } from '@/lib/songs/server-catalog';

export const dynamic = 'force-dynamic';

/** Página pública: só músicas publicadas (admin=false). Sem vazar estado admin. */
export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // catálogo público: nunca servir rascunho/pending por slug
  const song = await getUnifiedSongBySlug(slug, { admin: false });
  if (!song && !slug.startsWith('user-')) notFound();
  return <SongPageClient slug={slug} serverSong={song} />;
}
