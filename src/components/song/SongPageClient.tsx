'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { PartnerOutdoorCard } from '@/components/ads/PartnerOutdoorCard';
import { CommentSection } from '@/components/song/CommentSection';
import { getHouseAdConfig } from '@/lib/ads/partner-outdoor';
import { recordVisit } from '@/lib/history/visit-history';
import { getUserSongBySlug } from '@/lib/songs/user-songs';
import type { Song } from '@/types/song/song.types';
import { SongView } from './SongView';

function artistSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function SongPageClient({
  slug,
  serverSong,
  adsOn = false,
}: {
  slug: string;
  serverSong: Song | null;
  isAdmin?: boolean;
  adsOn?: boolean;
}) {
  const { data: session } = useSession();
  const [song, setSong] = useState<Song | null>(serverSong);
  const [ready, setReady] = useState(Boolean(serverSong));
  const [favMsg, setFavMsg] = useState('');

  useEffect(() => {
    if (serverSong) {
      setSong(serverSong);
      setReady(true);
      recordVisit({
        slug: serverSong.slug,
        title: serverSong.title,
        artist: serverSong.artist,
      });
      if (session?.user) {
        void fetch('/api/me/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songSlug: serverSong.slug }),
        });
      }
      return;
    }
    const local = getUserSongBySlug(slug);
    setSong(local);
    setReady(true);
    if (local) {
      recordVisit({ slug: local.slug, title: local.title, artist: local.artist });
    }
  }, [slug, serverSong, session?.user]);

  const addFavorite = async () => {
    if (!song) return;
    const res = await fetch('/api/me/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songSlug: song.slug }),
    });
    setFavMsg(res.ok ? 'Salvo nos favoritos.' : 'Faça login ou rode db:push.');
  };

  if (!ready) {
    return <div className="px-4 py-20 text-center text-sm text-neutral-500">Carregando cifra…</div>;
  }

  if (!song) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-chakra text-2xl font-bold">Música não encontrada</h1>
        <Link href="/" className="mt-6 inline-block text-primary-400 underline">
          Voltar ao acervo
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-3 pt-4 print:hidden">
        <Link
          href={`/artista/${artistSlug(song.artist)}`}
          className="text-xs text-primary-400 hover:underline"
        >
          Mais de {song.artist}
        </Link>
        {session?.user && (
          <button
            type="button"
            onClick={addFavorite}
            className="rounded-lg border border-stroke-200 px-3 py-1 text-xs hover:border-primary-500"
          >
            ★ Favoritar
          </button>
        )}
        {favMsg && <span className="text-xs text-neutral-500">{favMsg}</span>}
      </div>
      <SongView song={song} adsOn={adsOn} />
      <div className="mx-auto max-w-[1440px] px-3 pb-12 print:hidden">
        <CommentSection songSlug={song.slug} />
        {/* SPEC_010 C3 mobile: DEPOIS dos comentários, nunca junto da cifra */}
        {adsOn && (
          <div className="mt-6 flex justify-center @tablet:hidden">
            <PartnerOutdoorCard config={getHouseAdConfig()} />
          </div>
        )}
      </div>
    </>
  );
}
