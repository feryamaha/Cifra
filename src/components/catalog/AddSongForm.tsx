'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChartPreview, ChordsOnlyPreview } from '@/components/catalog/ChartPreview';
import { SubmitResultModal } from '@/components/catalog/SubmitResultModal';
import { WorkLookup } from '@/components/catalog/WorkLookup';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { TUNING_LIST } from '@/data/music/tunings.data';
import {
  extractTextFromFile,
  getUploadExt,
  hasChords,
  metaFromFileName,
  parseChartToDraft,
  type SongDraft,
} from '@/lib/parsers';
import {
  applyAutoProgressionsIfEmpty,
  getUserSongBySlug,
  parseChordsText,
  parseProgressionsText,
  progressionsToText,
  songToChartText,
  userSongFromDraft,
  userSongFromInput,
} from '@/lib/songs/user-songs';
import { cn } from '@/lib/utils';
import type { Song } from '@/types/song/song.types';

const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const GENRES = ['Worship', 'Gospel', 'MPB', 'Pop', 'Rock', 'Sertanejo', 'Outro'];

type Tab = 'paste' | 'upload' | 'manual';

const SAMPLE_CIFRA_CLUB = `Gratidão
Artista X
Tom: G

[Intro]
G  D  Em  C

[Verso]
G              D
letra da música aqui
Em             C
continua a letra

[Refrão]
C     G     D     G
texto do refrão
`;

export function AddSongForm() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('editar');
  /** Cifra publicada (toolbar Editar): /adicionar?editarSlug=... */
  const editPublishedSlug = searchParams.get('editarSlug');
  const editVersionId = searchParams.get('editarVersao');
  const [editing, setEditing] = useState<Song | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  /** Edição colaborativa de cifra já publicada (sempre new_version → revisão). */
  const [editingPublished, setEditingPublished] = useState(false);
  const loadedEditRef = useRef<string | null>(null);

  // Editar cifra publicada exige login (toolbar Editar / URL direta)
  useEffect(() => {
    if (!editPublishedSlug || sessionStatus === 'loading') return;
    if (!session?.user) {
      router.replace(
        `/entrar?como=user&callbackUrl=${encodeURIComponent(`/adicionar?editarSlug=${editPublishedSlug}`)}`,
      );
    }
  }, [editPublishedSlug, session, sessionStatus, router]);
  const [tab, setTab] = useState<Tab>('paste');

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Cifras');
  const [key, setKey] = useState('C');
  const [tuning, setTuning] = useState('standard');
  const [bpm, setBpm] = useState<number | undefined>();
  const [chordsText, setChordsText] = useState('C G Am F');
  /** Uma progressão por linha (opcional; fonte de verdade no painel). */
  const [progressionsText, setProgressionsText] = useState('');

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [extracting, setExtracting] = useState(false);

  const [draft, setDraft] = useState<SongDraft | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultOk, setResultOk] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const manualChords = useMemo(() => parseChordsText(chordsText), [chordsText]);

  const applyParse = useCallback(
    (text: string, preset?: Partial<Pick<SongDraft, 'title' | 'artist' | 'key' | 'bpm'>>) => {
      setError('');
      const d = parseChartToDraft(text);
      // metadados conhecidos (nome do arquivo, cifra em edição) preenchem lacunas
      if (preset?.title && !d.title) d.title = preset.title;
      if (preset?.artist && !d.artist) d.artist = preset.artist;
      if (preset?.key) d.key = preset.key;
      if (preset?.bpm) d.bpm = preset.bpm;
      // metadados do formulário sobrescrevem se o usuário já preencheu
      if (title.trim()) d.title = title.trim();
      if (artist.trim()) d.artist = artist.trim();
      d.genre = genre;
      d.tuning = tuning;
      if (bpm != null) d.bpm = bpm;
      if (key && key !== 'C') d.key = key;
      else if (d.key) setKey(d.key);

      setDraft(d);
      if (d.title && !title.trim()) setTitle(d.title);
      if (d.artist && !artist.trim()) setArtist(d.artist);
      if (d.key) setKey(d.key);
      if (d.bpm != null && d.bpm > 0) setBpm(d.bpm);

      if (!hasChords(d)) {
        setError(
          'Nenhum acorde encontrado. Cole uma cifra com acordes (formato Cifra Club ou ChordPro).',
        );
      }
    },
    [title, artist, genre, key, tuning, bpm],
  );

  // Edição de versão no servidor: /adicionar?editarVersao=<id>
  useEffect(() => {
    if (!editVersionId || loadedEditRef.current === `v:${editVersionId}`) return;
    loadedEditRef.current = `v:${editVersionId}`;
    (async () => {
      const res = await fetch(`/api/me/versions/${encodeURIComponent(editVersionId)}`);
      if (!res.ok) {
        setError('Versão não encontrada ou sem permissão.');
        return;
      }
      const data = (await res.json()) as {
        version?: {
          id: string;
          payload: Song;
          workTitle: string;
          workArtist: string;
        };
      };
      const v = data.version;
      if (!v) return;
      setEditingVersionId(v.id);
      const song = v.payload;
      setTitle(v.workTitle || song.title);
      setArtist(v.workArtist || song.artist);
      setGenre(song.genre || 'Cifras');
      setKey(song.key || song.originalKey || 'C');
      setTuning(song.tuning || 'standard');
      if (song.bpm != null && song.bpm > 0) setBpm(song.bpm);
      const text = song.sourceText || songToChartText(song);
      setRawText(text);
      setProgressionsText(progressionsToText(song.progressions));
      setTab('paste');
      applyParse(text, {
        title: v.workTitle || song.title,
        artist: v.workArtist || song.artist,
        key: song.key,
        bpm: song.bpm,
      });
    })();
  }, [editVersionId, applyParse]);

  // Edição de cifra publicada (botão Editar na toolbar): carrega payload público
  useEffect(() => {
    if (!editPublishedSlug || editVersionId) return;
    if (sessionStatus !== 'authenticated' || !session?.user) return;
    if (loadedEditRef.current === `pub:${editPublishedSlug}`) return;
    loadedEditRef.current = `pub:${editPublishedSlug}`;
    (async () => {
      const res = await fetch(`/api/songs/${encodeURIComponent(editPublishedSlug)}`);
      if (!res.ok) {
        setError('Cifra não encontrada para edição.');
        return;
      }
      const data = (await res.json()) as { song?: Song };
      const song = data.song;
      if (!song) {
        setError('Cifra não encontrada para edição.');
        return;
      }
      setEditingPublished(true);
      setEditingVersionId(null); // nunca edit_own: sempre nova versão para o admin
      setEditing(song);
      setTitle(song.title);
      setArtist(song.artist);
      setGenre(song.genre || 'Cifras');
      setKey(song.key || song.originalKey || 'C');
      setTuning(song.tuning || 'standard');
      if (song.bpm != null && song.bpm > 0) setBpm(song.bpm);
      else setBpm(undefined);
      const text = song.sourceText || songToChartText(song);
      setRawText(text);
      setProgressionsText(progressionsToText(song.progressions));
      setTab('paste');
      applyParse(text, {
        title: song.title,
        artist: song.artist,
        key: song.key,
        bpm: song.bpm,
      });
    })();
  }, [editPublishedSlug, editVersionId, applyParse, session, sessionStatus]);

  // Legado: /adicionar?editar=<slug> localStorage
  useEffect(() => {
    if (!editSlug || editVersionId || editPublishedSlug) return;
    if (loadedEditRef.current === editSlug) return;
    loadedEditRef.current = editSlug;
    const song = getUserSongBySlug(editSlug);
    if (!song) {
      setError('Cifra não encontrada para edição.');
      return;
    }
    setEditing(song);
    setTitle(song.title);
    setArtist(song.artist);
    setGenre(song.genre);
    setKey(song.key);
    setTuning(song.tuning);
    if (song.bpm != null && song.bpm > 0) setBpm(song.bpm);
    else setBpm(undefined);
    const text = song.sourceText || songToChartText(song);
    setRawText(text);
    setProgressionsText(progressionsToText(song.progressions));
    setTab('paste');
    applyParse(text, { title: song.title, artist: song.artist, key: song.key, bpm: song.bpm });
  }, [editSlug, editVersionId, editPublishedSlug, applyParse]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError('');
    if (!getUploadExt(file)) {
      setError('Use apenas .txt, .docx ou .pdf.');
      return;
    }
    setExtracting(true);
    setFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      setRawText(text);
      setTab('paste');
      // "Bruna Olly - Gratidão.txt" → artista/título quando a cifra não os traz
      applyParse(text, metaFromFileName(file.name));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao ler o arquivo.');
    } finally {
      setExtracting(false);
    }
  };

  const mergeDraftMeta = (d: SongDraft): SongDraft => ({
    ...d,
    title: title.trim() || d.title,
    artist: artist.trim() || d.artist,
    genre,
    key,
    tuning,
    bpm,
  });

  /**
   * SPEC_001: envia só para moderação no servidor.
   * NUNCA grava no catálogo público nem no localStorage como música publicada.
   */
  const submitForReview = async (song: Song): Promise<boolean> => {
    const payload: Song = {
      ...song,
      published: false,
      source: 'user',
      title: title.trim() || song.title,
      artist: artist.trim() || song.artist || 'Desconhecido',
    };

    // Edição de cifra publicada: sempre new_version (usuário nunca publica).
    // edit_own só para reenvio da própria versão pendente (Meus envios).
    const useEditOwn = Boolean(editingVersionId) && !editingPublished;
    const res = await fetch('/api/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        useEditOwn
          ? {
              artist: payload.artist,
              title: payload.title,
              song: payload,
              intent: 'edit_own',
              versionId: editingVersionId,
            }
          : {
              artist: payload.artist,
              title: payload.title,
              song: payload,
              intent: 'new_version',
              label: editingPublished ? 'correção colaborativa' : undefined,
            },
      ),
    });

    if (res.status === 401) {
      const back =
        editPublishedSlug != null
          ? `/adicionar?editarSlug=${encodeURIComponent(editPublishedSlug)}`
          : '/adicionar';
      router.push(`/entrar?como=user&callbackUrl=${encodeURIComponent(back)}`);
      return false;
    }

    const data = (await res.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    if (!res.ok) {
      setResultOk(false);
      setResultMsg(data?.error ?? 'Falha ao enviar para moderação.');
      setResultOpen(true);
      return false;
    }

    setResultOk(true);
    setResultMsg(
      data?.message ??
        (editingPublished
          ? 'Edição enviada para o admin revisar. A cifra pública só muda depois da aprovação e republicação.'
          : 'Cifra enviada para revisão do admin. Ela NÃO aparece no catálogo até ser aprovada.'),
    );
    setResultOpen(true);
    return true;
  };

  const saveManual = async () => {
    setError('');
    if (!title.trim()) {
      setError('Informe o título.');
      return;
    }
    if (!artist.trim()) {
      setError('Informe o artista.');
      return;
    }
    if (manualChords.length === 0) {
      setError('Informe pelo menos um acorde (ex: C G Am F).');
      return;
    }
    setBusy(true);
    try {
      // só monta o objeto em memória — não persiste no catálogo local
      let song = userSongFromInput({ title, artist, genre, key, tuning, chordsText });
      const progs = parseProgressionsText(progressionsText);
      if (progs.length > 0) song = { ...song, progressions: progs };
      else song = applyAutoProgressionsIfEmpty(song);
      await submitForReview(song);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar.');
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = async () => {
    setError('');
    if (!draft) {
      setError('Processe a cifra antes de salvar.');
      return;
    }
    const merged = mergeDraftMeta(draft);
    if (!merged.title.trim()) {
      setError('Informe o título.');
      return;
    }
    if (!artist.trim() && !merged.artist?.trim()) {
      setError('Informe o artista.');
      return;
    }
    if (!hasChords(merged)) {
      setError('A música precisa ter cifras (acordes).');
      return;
    }
    setBusy(true);
    try {
      // só monta o objeto em memória — fila pending_review no servidor
      const progs = parseProgressionsText(progressionsText);
      let song = userSongFromDraft(merged, {
        progressions: progs.length > 0 ? progs : undefined,
      });
      if (progs.length === 0) song = applyAutoProgressionsIfEmpty(song);
      await submitForReview(song);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 @tablet:grid-cols-2">
      <SubmitResultModal
        open={resultOpen}
        ok={resultOk}
        message={resultMsg}
        onClose={() => setResultOpen(false)}
      />
      <div className="space-y-4">
        {editingPublished && editing && (
          <p className="rounded-lg border border-primary-600 bg-primary-950/40 px-3 py-2 text-sm text-primary-300">
            Editando a cifra publicada <strong>{editing.title}</strong> (letra, acordes e
            progressões). Ao enviar, a alteração vai para o <strong>admin revisar</strong> — você
            não publica direto. Só após aprovação a versão pública é atualizada.
          </p>
        )}
        {editing && !editingPublished && (
          <p className="rounded-lg border border-primary-600 bg-primary-950/40 px-3 py-2 text-sm text-primary-300">
            Editando <strong>{editing.title}</strong>: ao salvar, a cifra atual é substituída.
          </p>
        )}
        <Card className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Obra (artista + música)
          </p>
          <div className="grid gap-3 @tablet:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-neutral-500">Artista *</span>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-neutral-900 outline-none focus:border-primary-400"
                placeholder="Ex: Bruna Olly"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-neutral-500">Música *</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-neutral-900 outline-none focus:border-primary-400"
                placeholder="Ex: Gratidão"
              />
            </label>
          </div>
          <WorkLookup artist={artist} title={title} />
          <p className="text-[11px] text-neutral-500">
            É preciso estar logado. A cifra vai para revisão e só o admin publica.
          </p>
        </Card>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['paste', 'Colar cifra'],
              ['upload', 'Upload'],
              ['manual', 'Só acordes'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                tab === id
                  ? 'border-primary-500 bg-primary-400 text-secondary-950'
                  : 'border-stroke-200 text-neutral-700 hover:border-primary-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Card className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Metadados
          </p>
          <div className="grid gap-3 @tablet:grid-cols-2">
            <Field label="Título *">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Nome da música"
              />
            </Field>
            <Field label="Artista">
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className={inputClass}
                placeholder="Artista ou banda"
              />
            </Field>
            <Field label="Gênero">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className={inputClass}
              >
                {(GENRES.includes(genre) ? GENRES : [genre, ...GENRES]).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tom">
              <select value={key} onChange={(e) => setKey(e.target.value)} className={inputClass}>
                {KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Afinação">
              <select
                value={tuning}
                onChange={(e) => setTuning(e.target.value)}
                className={inputClass}
              >
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
                className={inputClass}
                placeholder="80"
              />
            </Field>
          </div>
        </Card>

        {tab === 'paste' && (
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Cole a cifra (Cifra Club / ChordPro)
              </p>
              <button
                type="button"
                className="text-[10px] text-primary-400 underline"
                onClick={() => {
                  setRawText(SAMPLE_CIFRA_CLUB);
                  applyParse(SAMPLE_CIFRA_CLUB);
                }}
              >
                Exemplo Cifra Club
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={16}
              spellCheck={false}
              className={cn(inputClass, 'font-mono text-xs leading-relaxed')}
              placeholder={`Cole aqui no formato:\n\nTítulo\nArtista\nTom: G\n\n[Verso]\nG              D\nletra da música aqui`}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => applyParse(rawText)}
                className="flex-1 rounded-xl border border-primary-600 py-2.5 text-sm font-semibold text-primary-300 hover:bg-primary-950"
              >
                Processar cifra
              </button>
              <button
                type="button"
                disabled={busy || !draft || !hasChords(draft)}
                onClick={saveDraft}
                className="flex-1 rounded-xl bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950 hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? 'Enviando…' : 'Enviar para revisão do admin'}
              </button>
            </div>
          </Card>
        )}

        {tab === 'upload' && (
          <Card className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Arquivo .txt · .docx · .pdf
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stroke-200 bg-secondary-900/50 px-4 py-12 transition-colors hover:border-primary-500">
              <input
                type="file"
                accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-sm text-neutral-700">
                {extracting ? 'Extraindo texto…' : 'Clique para escolher o arquivo'}
              </span>
              {fileName && (
                <span className="mt-2 font-mono text-xs text-primary-400">{fileName}</span>
              )}
            </label>
            {draft && hasChords(draft) && (
              <button
                type="button"
                disabled={busy}
                onClick={saveDraft}
                className="w-full rounded-xl bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950 hover:bg-primary-300 disabled:opacity-50"
              >
                {busy ? 'Enviando…' : 'Enviar para revisão do admin'}
              </button>
            )}
          </Card>
        )}

        {tab === 'manual' && (
          <Card className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Progressão de acordes *
            </p>
            <textarea
              value={chordsText}
              onChange={(e) => setChordsText(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="C G Am F"
            />
            <p className="text-xs text-neutral-500">{manualChords.length} acorde(s)</p>
            <button
              type="button"
              disabled={busy}
              onClick={saveManual}
              className="w-full rounded-xl bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950 hover:bg-primary-300 disabled:opacity-50"
            >
              {busy ? 'Enviando…' : 'Enviar para revisão do admin'}
            </button>
          </Card>
        )}

        <Card className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Progressões que se repetem (opcional)
          </p>
          <p className="text-[11px] text-neutral-500">
            Uma progressão por linha; acordes separados por espaço. Se preencher, o painel da cifra
            usa isto em vez da detecção automática.
          </p>
          <textarea
            value={progressionsText}
            onChange={(e) => setProgressionsText(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder={'C G Am F\nAm F C G\nF G C'}
          />
        </Card>

        {error && (
          <p className="rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
            {error}
          </p>
        )}
      </div>

      {/* Preview monoespaçado */}
      <div className="space-y-3 @tablet:sticky @tablet:top-4 @tablet:self-start">
        <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Preview (revise antes de salvar)
        </p>
        <Card className="min-h-[320px] space-y-4">
          {tab === 'manual' && (
            <>
              <PreviewHeader
                title={title}
                artist={artist}
                keyName={key}
                genre={genre}
                format="manual"
                chordCount={manualChords.length}
              />
              <ChordsOnlyPreview chords={manualChords} />
            </>
          )}

          {(tab === 'paste' || tab === 'upload') && draft && (
            <>
              <PreviewHeader
                title={title || draft.title}
                artist={artist || draft.artist}
                keyName={key || draft.key}
                genre={genre}
                format={draft.sourceFormat}
                chordCount={draft.chords.length}
              />
              {draft.warnings.length > 0 && (
                <ul className="list-inside list-disc text-xs text-auxiliary-warning-default">
                  {draft.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
              <ChartPreview draft={mergeDraftMeta(draft)} />
            </>
          )}

          {(tab === 'paste' || tab === 'upload') && !draft && (
            <p className="text-sm text-neutral-500">
              Cole a cifra no formato Cifra Club e clique em <strong>Processar cifra</strong>. O
              preview mostra os acordes alinhados sobre a letra.
            </p>
          )}
        </Card>
        <p className="text-xs text-neutral-500">
          A cifra fica disponível imediatamente para você (neste navegador) e vai para a fila de
          moderação: só entra no catálogo público depois de aprovada. Música sem acordes não pode
          ser salva.
        </p>
      </div>
    </div>
  );
}

function PreviewHeader({
  title,
  artist,
  keyName,
  genre,
  format,
  chordCount,
}: {
  title: string;
  artist: string;
  keyName: string;
  genre: string;
  format: string;
  chordCount: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        <Badge variant="info">{format}</Badge>
        <Badge variant="amber">Tom: {keyName || '?'}</Badge>
        <Badge>{genre}</Badge>
        {chordCount > 0 ? (
          <Badge variant="success">{chordCount} acordes</Badge>
        ) : (
          <Badge variant="danger">sem acordes</Badge>
        )}
      </div>
      <h2 className="font-chakra text-xl font-bold text-neutral-900">{title || 'Sem título'}</h2>
      <p className="text-sm text-neutral-700">{artist || 'Artista'}</p>
    </div>
  );
}

const inputClass =
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
