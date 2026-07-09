import { notFound } from 'next/navigation';
import { SongView } from '@/components/song/SongView';
import { getAllSongSlugs, getSongBySlug } from '@/utils/song-catalog.helpers';

export function generateStaticParams() {
  return getAllSongSlugs().map((slug) => ({ slug }));
}

/** No Next.js 16 `params` é assíncrono: precisa de await. */
export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) notFound();
  return <SongView song={song} />;
}
