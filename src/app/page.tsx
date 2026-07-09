import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getAllSongs } from '@/utils/song-catalog.helpers';

/**
 * Home: catálogo de músicas. Hoje lê o registro estático (src/data/songs);
 * quando houver banco, esta página vira uma query paginada.
 */
export default function HomePage() {
  const songs = getAllSongs();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-10">
        <h1 className="font-chakra text-4xl font-bold text-neutral-900">
          Cifras feitas para quem toca <span className="text-primary-400">violão</span>
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-700">
          Transposição real, capotraste calculado automaticamente, números da escala e shapes que se
          adaptam à afinação do seu instrumento. Sem anúncio no meio da cifra, nunca.
        </p>
      </section>

      <h2 className="mb-4 font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
        Catálogo
      </h2>
      <div className="grid gap-4 @tablet:grid-cols-2 @Desktop:grid-cols-3">
        {songs.map((s) => (
          <Link key={s.slug} href={`/musica/${s.slug}`} className="group">
            <Card className="transition-colors group-hover:border-primary-700">
              <h3 className="font-chakra text-lg font-semibold text-neutral-900 group-hover:text-primary-300">
                {s.title}
              </h3>
              <p className="mb-3 text-sm text-neutral-700">{s.artist}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="amber">Tom: {s.originalKey}</Badge>
                <Badge>BPM: {s.bpm}</Badge>
                <Badge>{s.timeSignature}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
