'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
  const PAGE = 60;

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

  const shown = filtered.slice(0, page * PAGE);

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

      <div className="flex items-center justify-between">
        <h2 className="font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Acervo
        </h2>
        <span className="font-mono text-xs text-neutral-500">
          {filtered.length.toLocaleString('pt-BR')} de {allSongs.length.toLocaleString('pt-BR')}
        </span>
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
        <div className="grid gap-3 @tablet:grid-cols-2 @Desktop:grid-cols-3">
          {shown.map((s) => (
            <Link key={s.slug} href={`/musica/${s.slug}`} className="group">
              <Card className="h-full transition-all duration-normal group-hover:border-primary-600 group-hover:shadow-glow-sm group-hover:-translate-y-0.5">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge variant="amber">Tom: {s.key || s.originalKey}</Badge>
                  {s.bpm != null && s.bpm > 0 && <Badge variant="neutral">BPM: {s.bpm}</Badge>}
                </div>
                <h3 className="font-chakra text-base font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-300">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-700 line-clamp-1">{s.artist}</p>
                {s.chords?.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-primary-400/90 line-clamp-1">
                    {s.chords.slice(0, 8).join(' · ')}
                    {s.chords.length > 8 ? '…' : ''}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {shown.length < filtered.length && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-stroke-200 bg-secondary-800 px-4 py-2 text-sm text-primary-300 hover:border-primary-500"
          >
            Carregar mais ({filtered.length - shown.length} restantes)
          </button>
        </div>
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
