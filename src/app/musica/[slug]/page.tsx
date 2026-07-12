import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { SongPageClient } from '@/components/song/SongPageClient';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import { getSiteUrl } from '@/lib/site-url';
import { getUnifiedSongBySlug } from '@/lib/songs/server-catalog';

export const dynamic = 'force-dynamic';

/** Dedupe entre generateMetadata e a página (mesmo request). */
const getSong = cache(async (slug: string) => getUnifiedSongBySlug(slug, { admin: false }));

/** SEO por cifra (SPEC_010 D1): título de busca "cifra de X" + OG. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) return { title: 'Cifra Tom · Cifras para violão' };

  const chords = (song.chords ?? []).slice(0, 6).join(', ');
  const title = `Cifra de ${song.title} · ${song.artist} (tom ${song.originalKey}) · Cifra Tom`;
  const description = `Cifra de ${song.title} de ${song.artist} para violão, no tom ${song.originalKey}. Acordes: ${chords}. Transposição, capotraste calculado e shapes no hover, sem anúncio no meio da cifra.`;
  const canonical = `${getSiteUrl()}/musica/${slug}`;
  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'music.song', locale: 'pt_BR' },
  };
}

/** Página pública: só músicas publicadas (admin=false). Sem vazar estado admin. */
export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // catálogo público: nunca servir rascunho/pending por slug
  const song = await getSong(slug);
  if (!song && !slug.startsWith('user-')) notFound();

  const jsonLd = song
    ? {
        '@context': 'https://schema.org',
        '@type': 'MusicComposition',
        name: song.title,
        composer: { '@type': 'MusicGroup', name: song.artist },
        musicalKey: song.originalKey,
        inLanguage: 'pt-BR',
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático gerado no servidor a partir de dados validados pelo schema Zod
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SongPageClient slug={slug} serverSong={song} adsOn={areAdsEnabled()} />
    </>
  );
}
