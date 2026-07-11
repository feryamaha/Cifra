import { notFound } from 'next/navigation';
import { AdminSongEditor } from '@/components/admin/AdminSongEditor';
import { getCatalogSongBySlug } from '@/lib/server/song-store';

export const dynamic = 'force-dynamic';

export default async function AdminEditSongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getCatalogSongBySlug(slug, { admin: true });
  if (!song) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-10 @Desktop:px-4">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">
          Admin · editar música
        </p>
        <h1 className="font-chakra text-3xl font-bold text-neutral-900">{song.title}</h1>
        <p className="mt-1 text-sm text-neutral-700">{song.artist}</p>
      </div>
      <AdminSongEditor song={song} />
    </div>
  );
}
