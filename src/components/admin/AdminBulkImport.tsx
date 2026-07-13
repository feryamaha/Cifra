'use client';

/**
 * Importação em lote (SPEC_010 B2): admin seleciona até 20 arquivos
 * (TXT, DOCX, PDF, ChordPro), o parse roda no client com os parsers
 * existentes, o admin revisa/edita título e artista na tabela e envia.
 * Publica direto via /api/admin/songs/import (admin é o moderador).
 */

import { Fragment, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  extractTextFromFile,
  getUploadExt,
  metaFromFileName,
  parseChartToDraft,
} from '@/lib/parsers';
import {
  applyAutoProgressionsIfEmpty,
  parseProgressionsText,
  userSongFromDraft,
} from '@/lib/songs/user-songs';
import type { Song } from '@/types/song/song.types';

const MAX_ITEMS = 20;
const MAX_FILE_BYTES = 1_000_000; // 1MB por arquivo (E3)

interface Row {
  fileName: string;
  title: string;
  artist: string;
  chordsCount: number;
  song: Song | null;
  parseError: string | null;
  /** texto bruto extraído: permite editar e reprocessar antes de publicar */
  raw: string | null;
  /** uma progressão por linha (opcional) */
  progressionsText?: string;
  editing?: boolean;
  sent?: { ok: boolean; slug?: string; error?: string };
}

function isChordProName(name: string): boolean {
  return /\.(pro|chordpro|cho|crd)$/i.test(name);
}

export function AdminBulkImport() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (list: FileList | null) => {
    if (!list) return;
    setSummary('');
    const files = [...list].slice(0, MAX_ITEMS);
    const next: Row[] = [];
    for (const file of files) {
      const meta = metaFromFileName(file.name);
      const base: Omit<Row, 'song' | 'parseError' | 'chordsCount' | 'raw' | 'editing'> = {
        fileName: file.name,
        title: meta.title || file.name.replace(/\.[^.]+$/, ''),
        artist: meta.artist || '',
      };
      if (file.size > MAX_FILE_BYTES) {
        next.push({
          ...base,
          song: null,
          chordsCount: 0,
          raw: null,
          parseError: 'Arquivo maior que 1MB.',
        });
        continue;
      }
      try {
        const text =
          getUploadExt(file) !== null
            ? await extractTextFromFile(file)
            : isChordProName(file.name)
              ? await file.text()
              : null;
        if (text === null) {
          next.push({
            ...base,
            song: null,
            chordsCount: 0,
            raw: null,
            parseError: 'Formato não suportado (use TXT, DOCX, PDF ou ChordPro).',
          });
          continue;
        }
        const draft = parseChartToDraft(text, {
          title: base.title,
          artist: base.artist || undefined,
        });
        const song = userSongFromDraft(draft, {});
        if (!song.chords || song.chords.length === 0) {
          next.push({
            ...base,
            title: song.title || base.title,
            artist: song.artist || base.artist,
            song: null,
            chordsCount: 0,
            raw: text,
            parseError: 'Nenhum acorde detectado: cifra não entra no catálogo.',
          });
          continue;
        }
        next.push({
          ...base,
          title: song.title || base.title,
          artist: song.artist || base.artist,
          song,
          chordsCount: song.chords.length,
          raw: text,
          parseError: null,
        });
      } catch {
        next.push({
          ...base,
          song: null,
          chordsCount: 0,
          raw: null,
          parseError: 'Falha ao ler o arquivo.',
        });
      }
    }
    setRows(next);
  };

  const setRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  /** Reparseia o texto (editado) da linha; limpa status de envio anterior. */
  const reprocess = (i: number) => {
    setRows((prev) =>
      prev.map((r, idx) => {
        if (idx !== i || r.raw === null) return r;
        try {
          const draft = parseChartToDraft(r.raw, {
            title: r.title,
            artist: r.artist || undefined,
          });
          const progs = parseProgressionsText(r.progressionsText ?? '');
          const song = userSongFromDraft(draft, {
            progressions: progs.length > 0 ? progs : undefined,
          });
          if (!song.chords || song.chords.length === 0) {
            return {
              ...r,
              song: null,
              chordsCount: 0,
              parseError: 'Nenhum acorde detectado: cifra não entra no catálogo.',
              sent: undefined,
            };
          }
          return {
            ...r,
            song,
            chordsCount: song.chords.length,
            parseError: null,
            editing: false,
            sent: undefined,
          };
        } catch {
          return {
            ...r,
            song: null,
            chordsCount: 0,
            parseError: 'Falha ao reprocessar o texto.',
            sent: undefined,
          };
        }
      }),
    );
  };

  const validRows = rows.filter((r) => r.song && r.title.trim() && r.artist.trim());

  const submit = async () => {
    if (validRows.length === 0) return;
    setBusy(true);
    setSummary('');
    try {
      const items = validRows.map((r) => {
        const progs = parseProgressionsText(r.progressionsText ?? '');
        const base = r.song as Song;
        let song: Song = {
          ...base,
          title: r.title.trim(),
          artist: r.artist.trim(),
          progressions: progs.length > 0 ? progs : undefined,
        };
        if (progs.length === 0) {
          song = applyAutoProgressionsIfEmpty({ ...song, progressions: undefined });
        }
        return {
          artist: r.artist.trim(),
          title: r.title.trim(),
          song,
        };
      });
      const res = await fetch('/api/admin/songs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = (await res.json()) as {
        results?: { index: number; ok: boolean; slug?: string; error?: string }[];
        okCount?: number;
        failCount?: number;
        error?: string;
      };
      if (!res.ok || !data.results) {
        setSummary(data.error || 'Falha na importação.');
        return;
      }
      setRows((prev) => {
        const valid = prev.filter((r) => r.song && r.title.trim() && r.artist.trim());
        for (const result of data.results ?? []) {
          const row = valid[result.index];
          if (row) row.sent = { ok: result.ok, slug: result.slug, error: result.error };
        }
        return [...prev];
      });
      setSummary(`Importação concluída: ${data.okCount} publicada(s), ${data.failCount} falha(s).`);
    } catch {
      setSummary('Erro de rede na importação.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-5 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".txt,.docx,.pdf,.pro,.chordpro,.cho,.crd"
          onChange={(e) => void onFiles(e.target.files)}
          className="text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border file:border-primary-600 file:bg-primary-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-secondary-950"
        />
        <span className="text-xs text-neutral-500">
          Até {MAX_ITEMS} arquivos por lote (TXT, DOCX, PDF, ChordPro; máx. 1MB cada)
        </span>
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke-200 text-left font-mono text-[10px] uppercase text-neutral-500">
                <th className="px-2 py-2">Arquivo</th>
                <th className="px-2 py-2">Título</th>
                <th className="px-2 py-2">Artista</th>
                <th className="px-2 py-2">Acordes</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <Fragment key={r.fileName + String(i)}>
                  <tr className="border-b border-stroke-100 align-top">
                    <td className="max-w-40 truncate px-2 py-2 font-mono text-xs">{r.fileName}</td>
                    <td className="px-2 py-2">
                      <input
                        value={r.title}
                        onChange={(e) => setRow(i, { title: e.target.value })}
                        className="w-full rounded border border-stroke-200 bg-secondary-900 px-2 py-1"
                        aria-label={`Título de ${r.fileName}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={r.artist}
                        onChange={(e) => setRow(i, { artist: e.target.value })}
                        placeholder="obrigatório"
                        className="w-full rounded border border-stroke-200 bg-secondary-900 px-2 py-1"
                        aria-label={`Artista de ${r.fileName}`}
                      />
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{r.chordsCount || '-'}</td>
                    <td className="px-2 py-2 text-xs">
                      {r.sent ? (
                        r.sent.ok ? (
                          <a
                            href={`/musica/${r.sent.slug}`}
                            className="text-primary-400 underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Publicada
                          </a>
                        ) : (
                          <span className="text-auxiliary-danger-default">{r.sent.error}</span>
                        )
                      ) : r.parseError ? (
                        <span className="text-auxiliary-danger-default">{r.parseError}</span>
                      ) : (
                        <span className="text-neutral-500">Pronta para importar</span>
                      )}
                      {r.raw !== null && (
                        <button
                          type="button"
                          onClick={() => setRow(i, { editing: !r.editing })}
                          className="ml-2 rounded border border-stroke-200 px-2 py-0.5 text-[11px] text-primary-300 hover:border-primary-500"
                        >
                          {r.editing ? 'Fechar' : 'Editar'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {r.editing && r.raw !== null && (
                    <tr className="border-b border-stroke-100 bg-secondary-900/40">
                      <td colSpan={5} className="space-y-2 px-2 py-3">
                        <textarea
                          value={r.raw}
                          onChange={(e) => setRow(i, { raw: e.target.value })}
                          rows={12}
                          aria-label={`Cifra de ${r.fileName}`}
                          className="w-full rounded-lg border border-stroke-200 bg-secondary-950 p-3 font-mono text-xs leading-relaxed"
                        />
                        <label className="block space-y-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                            Progressões (opcional, uma por linha)
                          </span>
                          <textarea
                            value={r.progressionsText ?? ''}
                            onChange={(e) => setRow(i, { progressionsText: e.target.value })}
                            rows={3}
                            aria-label={`Progressões de ${r.fileName}`}
                            placeholder={'C G Am F\nAm F C G'}
                            className="w-full rounded-lg border border-stroke-200 bg-secondary-950 p-2 font-mono text-xs"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => reprocess(i)}
                          className="rounded-lg border border-primary-600 bg-primary-400 px-4 py-1.5 text-xs font-semibold text-secondary-950 hover:bg-primary-300"
                        >
                          Reprocessar cifra
                        </button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy || validRows.length === 0}
          onClick={() => void submit()}
          className="rounded-xl border border-primary-600 bg-primary-400 px-5 py-2.5 text-sm font-semibold text-secondary-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Importando…' : `Importar ${validRows.length} cifra(s)`}
        </button>
        {summary && <p className="text-sm text-neutral-700">{summary}</p>}
      </div>
    </Card>
  );
}
