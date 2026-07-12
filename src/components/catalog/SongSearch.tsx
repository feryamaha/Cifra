'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Song } from '@/types/song/song.types';
import {
  filterAndSortSongs,
  getArtists,
  getGenres,
  getKeys,
  type SortOption,
} from '@/utils/song-catalog.helpers';

export interface SongSearchProps {
  songs: Song[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Título' },
  { value: 'artist', label: 'Artista' },
  { value: 'key', label: 'Tom' },
  { value: 'genre', label: 'Gênero' },
];

/**
 * Catálogo público: SOMENTE músicas do servidor (demos + published).
 * Envios pending NUNCA entram aqui (SPEC_001). localStorage não mistura no acervo.
 */
export function SongSearch({ songs: serverSongs }: SongSearchProps) {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');
  const [artist, setArtist] = useState('Todos');
  const [key, setKey] = useState('Todos');
  const [difficulty, setDifficulty] = useState('Todos');
  const [searchLyrics, setSearchLyrics] = useState(false);
  const [sort, setSort] = useState<SortOption>('title');
  const [page, setPage] = useState(1);
  // SPEC_010 acervo-R: modos de visualização + paginação numerada
  const [viewMode, setViewMode] = useState<'galeria' | 'colunas' | 'lista' | 'icones'>('galeria');
  const [favState, setFavState] = useState<Record<string, 'ok' | 'login' | 'err'>>({});
  const PAGE = 24;

  // Estado inicial dos favoritos (exige login de USUÁRIO; sessão admin é outra)
  useEffect(() => {
    let alive = true;
    void fetch('/api/me/favorites')
      .then((r) => (r.ok ? (r.json() as Promise<{ favorites?: { songSlug: string }[] }>) : null))
      .then((data) => {
        if (!alive || !data?.favorites) return;
        setFavState((p) => {
          const next = { ...p };
          for (const f of data.favorites ?? []) next[f.songSlug] = 'ok';
          return next;
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  /** Toggle real: favoritar (POST) e desfavoritar (DELETE), estrela reflete o estado. */
  const toggleFavorite = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = favState[slug] === 'ok';
    try {
      const res = isFav
        ? await fetch(`/api/me/favorites?songSlug=${encodeURIComponent(slug)}`, {
            method: 'DELETE',
          })
        : await fetch('/api/me/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songSlug: slug }),
          });
      setFavState((p) => {
        const next = { ...p };
        if (res.ok) {
          if (isFav) delete next[slug];
          else next[slug] = 'ok';
        } else {
          next[slug] = res.status === 401 ? 'login' : 'err';
        }
        return next;
      });
    } catch {
      setFavState((p) => ({ ...p, [slug]: 'err' }));
    }
  };

  const allSongs = serverSongs;

  const genres = useMemo(() => getGenres(allSongs), [allSongs]);
  const artists = useMemo(() => getArtists(allSongs), [allSongs]);
  const keys = useMemo(() => getKeys(allSongs), [allSongs]);

  const filtered = useMemo(
    () =>
      filterAndSortSongs(allSongs, {
        query,
        genre,
        artist,
        key,
        difficulty,
        searchLyrics,
        sort,
      }),
    [allSongs, query, genre, artist, key, difficulty, searchLyrics, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const currentPage = Math.min(page, totalPages);
  const shown = filtered.slice((currentPage - 1) * PAGE, currentPage * PAGE);

  const setFilter = <T,>(setter: (v: T) => void) => {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 @tablet:flex-row @tablet:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="song-search" className="sr-only">
            Buscar músicas
          </label>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            id="song-search"
            type="search"
            value={query}
            onChange={(e) => setFilter(setQuery)(e.target.value)}
            placeholder={
              searchLyrics
                ? 'Buscar título, artista ou trecho de letra…'
                : 'Buscar por título, artista, tom…'
            }
            className="w-full rounded-xl border border-stroke-200 bg-secondary-900 py-3 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <Link
          href="/adicionar"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary-600 bg-primary-400 px-4 py-3 text-sm font-semibold text-secondary-950 transition-colors hover:bg-primary-300"
        >
          + Adicionar música
        </Link>
      </div>

      <label className="flex items-center gap-2 text-xs text-neutral-600">
        <input
          type="checkbox"
          checked={searchLyrics}
          onChange={(e) => setFilter(setSearchLyrics)(e.target.checked)}
        />
        Incluir trecho de letra (D5)
      </label>

      <div className="grid gap-2 @tablet:grid-cols-5">
        <FilterSelect
          label="Gênero"
          value={genre}
          onChange={setFilter(setGenre)}
          options={['Todos', ...genres]}
        />
        <FilterSelect
          label="Artista"
          value={artist}
          onChange={setFilter(setArtist)}
          options={['Todos', ...artists]}
        />
        <FilterSelect
          label="Tom"
          value={key}
          onChange={setFilter(setKey)}
          options={['Todos', ...keys]}
        />
        <FilterSelect
          label="Dificuldade"
          value={difficulty}
          onChange={setFilter(setDifficulty)}
          options={['Todos', 'iniciante', 'intermediario', 'avancado']}
        />
        <div>
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Ordenar
          </span>
          <select
            value={sort}
            onChange={(e) => setFilter(setSort)(e.target.value as SortOption)}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-2 py-2 text-sm text-neutral-900"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todos', ...genres].slice(0, 12).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(setGenre)(g)}
            className={cn(
              'rounded-full border px-3 py-1 font-mono text-xs transition-colors',
              genre === g
                ? 'border-primary-500 bg-primary-400 font-semibold text-secondary-950'
                : 'border-stroke-200 bg-secondary-900 text-neutral-700 hover:border-primary-600',
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Acervo
        </h2>
        <div className="flex items-center gap-3">
          <fieldset
            className="flex items-center gap-1 rounded-lg border border-stroke-200 bg-secondary-900 p-1"
            aria-label="Modo de visualização"
          >
            {(
              [
                ['galeria', 'Galeria'],
                ['colunas', 'Colunas'],
                ['lista', 'Lista'],
                ['icones', 'Ícones'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={viewMode === mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'rounded px-2 py-1 font-mono text-[11px] transition-colors',
                  viewMode === mode
                    ? 'bg-primary-400 font-semibold text-secondary-950'
                    : 'text-neutral-600 hover:text-primary-300',
                )}
              >
                {label}
              </button>
            ))}
          </fieldset>
          <span className="font-mono text-xs text-neutral-500">
            {filtered.length.toLocaleString('pt-BR')} de {allSongs.length.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-stroke-100 bg-secondary-900/50 px-4 py-10 text-center text-sm text-neutral-500">
          Nenhuma música encontrada. Tente outros filtros ou{' '}
          <Link href="/adicionar" className="text-primary-400 underline">
            adicione a sua
          </Link>
          .
        </p>
      ) : (
        <div
          className={cn(
            viewMode === 'galeria' && 'grid gap-3 @tablet:grid-cols-2 @Desktop:grid-cols-3',
            viewMode === 'colunas' && 'grid gap-3 @tablet:grid-cols-2',
            viewMode === 'lista' && 'space-y-2',
            viewMode === 'icones' &&
              'grid grid-cols-2 gap-2 @tablet:grid-cols-4 @Desktop:grid-cols-6',
          )}
        >
          {shown.map((s) => {
            const fav = favState[s.slug];
            const favButton = (
              <button
                type="button"
                onClick={(e) => void toggleFavorite(e, s.slug)}
                aria-label={fav === 'ok' ? `${s.title} favoritada` : `Favoritar ${s.title}`}
                title={
                  fav === 'ok'
                    ? 'Nos favoritos'
                    : fav === 'login'
                      ? 'Faça login para favoritar'
                      : 'Favoritar'
                }
                className={cn(
                  'shrink-0 rounded-md p-1 text-lg leading-none transition-colors',
                  fav === 'ok' ? 'text-primary-400' : 'text-neutral-500 hover:text-primary-300',
                )}
              >
                {fav === 'ok' ? '★' : '☆'}
              </button>
            );

            if (viewMode === 'icones') {
              return (
                <Link key={s.slug} href={`/musica/${s.slug}`} className="group">
                  <Card className="flex h-full flex-col items-center gap-1 p-3 text-center transition-all duration-normal group-hover:border-primary-600">
                    <span className="font-mono text-[10px] text-primary-400">
                      {s.key || s.originalKey}
                    </span>
                    <h3 className="font-chakra text-xs font-semibold text-neutral-900 line-clamp-2">
                      {s.title}
                    </h3>
                    {favButton}
                  </Card>
                </Link>
              );
            }

            if (viewMode === 'lista') {
              return (
                <Link key={s.slug} href={`/musica/${s.slug}`} className="group block">
                  <Card className="flex items-center gap-3 px-4 py-2.5 transition-all duration-normal group-hover:border-primary-600">
                    <Badge variant="amber">{s.key || s.originalKey}</Badge>
                    <h3 className="min-w-0 flex-1 truncate font-chakra text-sm font-semibold text-neutral-900 group-hover:text-primary-300">
                      {s.title}
                      <span className="ml-2 font-sans text-xs font-normal text-neutral-600">
                        {s.artist}
                      </span>
                    </h3>
                    {fav === 'login' && (
                      <span className="text-[10px] text-neutral-500">faça login</span>
                    )}
                    {favButton}
                  </Card>
                </Link>
              );
            }

            return (
              <Link key={s.slug} href={`/musica/${s.slug}`} className="group">
                <Card className="h-full transition-all duration-normal group-hover:border-primary-600 group-hover:shadow-glow-sm group-hover:-translate-y-0.5">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="amber">Tom: {s.key || s.originalKey}</Badge>
                    {s.bpm != null && s.bpm > 0 && <Badge variant="neutral">BPM: {s.bpm}</Badge>}
                    <span className="ml-auto">{favButton}</span>
                  </div>
                  <h3 className="font-chakra text-base font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-300">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-700 line-clamp-1">{s.artist}</p>
                  {(viewMode === 'galeria' || viewMode === 'colunas') && s.chords?.length > 0 && (
                    <p className="mt-2 font-mono text-[11px] text-primary-400/90 line-clamp-1">
                      {s.chords.slice(0, viewMode === 'colunas' ? 12 : 8).join(' · ')}
                      {s.chords.length > (viewMode === 'colunas' ? 12 : 8) ? '…' : ''}
                    </p>
                  )}
                  {fav === 'login' && (
                    <p className="mt-1 text-[10px] text-neutral-500">Faça login para favoritar</p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1" aria-label="Paginação do acervo">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded-lg border border-stroke-200 px-3 py-1.5 text-sm text-neutral-700 disabled:opacity-40"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 2)
            .map((n, idx, arr) => (
              <span key={n} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== n - 1 && (
                  <span className="px-1 text-neutral-500">…</span>
                )}
                <button
                  type="button"
                  aria-current={n === currentPage ? 'page' : undefined}
                  onClick={() => setPage(n)}
                  className={cn(
                    'min-w-9 rounded-lg border px-2 py-1.5 font-mono text-sm',
                    n === currentPage
                      ? 'border-primary-500 bg-primary-400 font-bold text-secondary-950'
                      : 'border-stroke-200 text-neutral-700 hover:border-primary-600',
                  )}
                >
                  {n}
                </button>
              </span>
            ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="rounded-lg border border-stroke-200 px-3 py-1.5 text-sm text-neutral-700 disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-2 py-2 text-sm text-neutral-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
