import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getUnifiedCatalog } from '@/lib/songs/server-catalog';

export const dynamic = 'force-dynamic';

function artistKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getUnifiedCatalog({ admin: false });
  const songs = catalog.filter((s) => artistKey(s.artist) === slug);
  const name = songs[0]?.artist ?? slug.replace(/-/g, ' ');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="font-mono text-xs uppercase tracking-wider text-primary-400">Artista</p>
      <h1 className="mt-1 font-chakra text-3xl font-bold capitalize">{name}</h1>
      {songs.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Nenhuma música pública deste artista.</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {songs.map((s) => (
            <li key={s.slug}>
              <Link href={`/musica/${s.slug}`}>
                <Card className="p-4 hover:border-primary-500">
                  <p className="font-chakra font-semibold">{s.title}</p>
                  <p className="text-xs text-neutral-500">
                    {s.key} · {s.genre}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/" className="mt-8 inline-block text-sm text-primary-400">
        ← Catálogo
      </Link>
    </div>
  );
}
