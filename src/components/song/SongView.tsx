'use client';

/**
 * SongView: composição da tela de cifra. A lógica inteira vive em
 * useSongView.hook.ts (estado) + song-view.helpers.ts (derivação pura).
 * Aqui é APENAS JSX, conforme a regra de criação de componentes.
 */

import { useEffect, useRef, useState } from 'react';
import { AUTO_SCROLL_OPTIONS } from '@/data/song-view/auto-scroll.data';
import { useAutoScroll, useSongView } from '@/hooks/song';
import { downloadTextFile, printSongAsPdf, songViewToTxt } from '@/lib/export/song-export';
import { cn } from '@/lib/utils';
import type { AutoScrollSpeed } from '@/types/song/auto-scroll.types';
import type { SongViewProps } from '@/types/song/song-view.types';
import { ChordSequencesPanel } from './ChordSequencesPanel';
import { SectionCard } from './SectionCard';
import { SongControls } from './SongControls';
import { SongHeader } from './SongHeader';
import { SongMap } from './SongMap';

export function SongView({ song }: SongViewProps) {
  const view = useSongView(song);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState<AutoScrollSpeed>('off');
  const downloadRef = useRef<HTMLDivElement>(null);

  useAutoScroll({ speed: autoScroll });

  useEffect(() => {
    if (!downloadOpen) return;
    const onDown = (e: PointerEvent) => {
      if (downloadRef.current?.contains(e.target as Node)) return;
      setDownloadOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [downloadOpen]);

  const onShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}${view.deepLinkQuery}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie o link:', url);
    }
  };

  const iconBtn =
    'flex h-10 w-10 items-center justify-center rounded-lg border border-stroke-200 bg-secondary-800 text-neutral-700 shadow-10 transition-colors hover:border-primary-400 hover:text-primary-300 focus-visible:outline-2 focus-visible:outline-primary-400';

  return (
    <>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 @tablet:grid-cols-[60%_40%]">
        {/* ============ COLUNA DA CIFRA (60%) ============ */}
        <div>
          <SongHeader view={view} />
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setControlsOpen(true)}
              aria-label="Controles"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-stroke-200 bg-secondary-800 text-primary-400 shadow-10 transition-colors hover:border-primary-400 hover:text-primary-300 focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="8" cy="6" r="2" fill="#f08a7a" stroke="none" />
                <circle cx="16" cy="12" r="2" fill="#f08a7a" stroke="none" />
                <circle cx="10" cy="18" r="2" fill="#f08a7a" stroke="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => printSongAsPdf()}
              aria-label="Imprimir"
              className={iconBtn}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </button>
            <div className="relative" ref={downloadRef}>
              <button
                type="button"
                onClick={() => setDownloadOpen(!downloadOpen)}
                aria-label="Baixar"
                className={iconBtn}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              {downloadOpen && (
                <div className="absolute top-12 left-0 z-50 w-44 rounded-lg border border-stroke-200 bg-secondary-900 py-1 shadow-popover">
                  <button
                    type="button"
                    onClick={() => {
                      printSongAsPdf();
                      setDownloadOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-secondary-800 hover:text-primary-300"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Baixar PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadTextFile(`${song.slug || 'cifra'}.txt`, songViewToTxt(view));
                      setDownloadOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-secondary-800 hover:text-primary-300"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Baixar TXT
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onShare}
              aria-label={copied ? 'Link copiado' : 'Compartilhar'}
              className={iconBtn}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            {/* Auto-rolagem: controle composto Off / Low / Mid / High */}
            <fieldset className="m-0 flex h-10 min-w-0 items-center gap-1.5 rounded-lg border border-stroke-200 bg-secondary-800 px-2 shadow-10">
              <legend className="sr-only">Auto-rolagem da cifra</legend>
              <span
                className="hidden pl-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500 sm:inline"
                aria-hidden
              >
                Auto-rolagem
              </span>
              <div className="inline-flex gap-0.5 rounded-md bg-secondary-900 p-0.5">
                {AUTO_SCROLL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={autoScroll === opt.value}
                    aria-label={
                      opt.value === 'off' ? 'Desligar auto-rolagem' : `Auto-rolagem ${opt.label}`
                    }
                    onClick={() => setAutoScroll(opt.value)}
                    className={cn(
                      'rounded px-2 py-1 font-chakra text-xs transition-colors duration-fast',
                      'focus-visible:outline-2 focus-visible:outline-primary-400',
                      autoScroll === opt.value
                        ? 'bg-primary-400 font-semibold text-secondary-950'
                        : 'text-neutral-700 hover:bg-secondary-800 hover:text-neutral-900',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {view.viewType === 'map' ? (
            <SongMap sections={view.mapSections} />
          ) : (
            <div className="flex flex-col gap-4" style={{ fontSize: `${view.fontScale}rem` }}>
              {view.renderedSections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  viewType={view.viewType}
                  selectedChord={view.selectedChord}
                  tuning={view.tuning}
                  resolveVoicing={view.resolveVoicing}
                  resolveVoicings={view.resolveVoicings}
                  onChordClick={view.selectChord}
                  lefty={view.lefty}
                  inlineDiagrams={view.inlineDiagrams}
                />
              ))}
            </div>
          )}
        </div>

        {/* ============ COLUNA DA TABELA DE SEQUÊNCIAS ============ */}
        <aside className="space-y-4 @tablet:sticky @tablet:top-4 @tablet:h-fit">
          <ChordSequencesPanel view={view} />
        </aside>
      </div>

      {controlsOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setControlsOpen(false)}
            role="presentation"
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-secondary-950 shadow-60">
            <div className="flex items-center justify-between border-b border-stroke-100 px-4 py-3">
              <h2 className="font-chakra text-lg font-semibold text-neutral-900">Controles</h2>
              <button
                type="button"
                onClick={() => setControlsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-stroke-100 hover:text-neutral-900"
                aria-label="Fechar"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <SongControls view={view} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
