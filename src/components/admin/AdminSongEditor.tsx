'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ChartPreview } from '@/components/catalog/ChartPreview';
import { Card } from '@/components/ui/Card';
import { TUNING_LIST } from '@/data/music/tunings.data';
import { hasChords, parseChartToDraft } from '@/lib/parsers';
import {
  applyAutoProgressionsIfEmpty,
  parseProgressionsText,
  progressionsToText,
  songToChartText,
  userSongFromDraft,
} from '@/lib/songs/user-songs';
import type { Song } from '@/types/song/song.types';

const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Editor do admin para QUALQUER música do catálogo. Texto → parser →
 * preview; salvar substitui a música no store preservando slug/id/origem.
 */
export function AdminSongEditor({ song }: { song: Song }) {
  const router = useRouter();
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [genre, setGenre] = useState(song.genre);
  const [key, setKey] = useState(song.key);
  const [tuning, setTuning] = useState(song.tuning);
  const [bpm, setBpm] = useState<number | undefined>(song.bpm);
  const [text, setText] = useState(() => song.sourceText || songToChartText(song));
  const [progressionsText, setProgressionsText] = useState(() =>
    progressionsToText(song.progressions),
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const draft = useMemo(() => {
    const d = parseChartToDraft(text);
    d.title = title.trim() || song.title;
    d.artist = artist.trim() || song.artist;
    d.genre = genre;
    d.key = key;
    d.tuning = tuning;
    d.bpm = bpm;
    return d;
  }, [text, title, artist, genre, key, tuning, bpm, song.title, song.artist]);

  const save = async () => {
    setError('');
    if (!hasChords(draft)) {
      setError('A cifra precisa ter pelo menos um acorde.');
      return;
    }
    setBusy(true);
    try {
      const progs = parseProgressionsText(progressionsText);
      const fresh = userSongFromDraft(draft, {
        progressions: progs.length > 0 ? progs : undefined,
      });
      let updated: Song = {
        ...fresh,
        id: song.id,
        slug: song.slug,
        source: song.source,
        published: song.published,
        progressions: progs.length > 0 ? progs : undefined,
      };
      if (progs.length === 0) {
        updated = applyAutoProgressionsIfEmpty({ ...updated, progressions: undefined });
      }
      const res = await fetch(`/api/admin/songs/${encodeURIComponent(song.slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: updated }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'Falha ao salvar.');
        return;
      }
      router.push(`/musica/${song.slug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 @tablet:grid-cols-2">
      <div className="space-y-4">
        <Card className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Metadados
          </p>
          <div className="grid gap-3 @tablet:grid-cols-2">
            <Field label="Título *">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
            </Field>
            <Field label="Artista">
              <input value={artist} onChange={(e) => setArtist(e.target.value)} className={input} />
            </Field>
            <Field label="Gênero">
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className={input} />
            </Field>
            <Field label="Tom">
              <select value={key} onChange={(e) => setKey(e.target.value)} className={input}>
                {(KEYS.includes(key) ? KEYS : [key, ...KEYS]).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Afinação">
              <select value={tuning} onChange={(e) => setTuning(e.target.value)} className={input}>
                {TUNING_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="BPM (opcional)">
              <input
                type="number"
                min={40}
                max={240}
                value={bpm ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setBpm(val ? Number.parseInt(val, 10) : undefined);
                }}
                className={input}
                placeholder="80"
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Cifra (acordes em cima da letra)
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={22}
            spellCheck={false}
            className={`${input} font-mono text-xs leading-relaxed`}
          />
        </Card>

        <Card className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Progressões que se repetem (opcional)
          </p>
          <p className="text-[11px] text-neutral-500">
            Uma por linha. Fonte de verdade no painel da cifra se preenchido.
          </p>
          <textarea
            value={progressionsText}
            onChange={(e) => setProgressionsText(e.target.value)}
            rows={5}
            spellCheck={false}
            className={`${input} font-mono text-xs leading-relaxed`}
            placeholder={'C G Am F\nAm F C G\nF G C'}
          />
          {error && (
            <p className="rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-stroke-200 py-2.5 text-sm text-neutral-700 hover:border-primary-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy || !hasChords(draft)}
              onClick={save}
              className="flex-1 rounded-xl bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950 hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </Card>
      </div>

      <div className="space-y-3 @tablet:sticky @tablet:top-4 @tablet:self-start">
        <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Preview (o que o público vê)
        </p>
        <Card className="min-h-[320px]">
          <ChartPreview draft={draft} />
        </Card>
      </div>
    </div>
  );
}

const input =
  'w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
