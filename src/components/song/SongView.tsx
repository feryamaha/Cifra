'use client';

/**
 * SongView: composição da tela de cifra. A lógica inteira vive em
 * useSongView.hook.ts (estado) + song-view.helpers.ts (derivação pura).
 * Aqui é APENAS JSX, conforme a regra de criação de componentes.
 */

import { useState } from 'react';
import { useSongView } from '@/hooks/song';
import type { SongViewProps } from '@/types/song/song-view.types';
import { ChordSequencesPanel } from './ChordSequencesPanel';
import { SectionCard } from './SectionCard';
import { SongControls } from './SongControls';
import { SongHeader } from './SongHeader';
import { SongMap } from './SongMap';

export function SongView({ song }: SongViewProps) {
  const view = useSongView(song);
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 @tablet:grid-cols-[60%_40%]">
        {/* ============ COLUNA DA CIFRA (60%) ============ */}
        <div>
          <SongHeader view={view} />
          <div className="mb-4 flex justify-start">
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
                  onChordClick={view.selectChord}
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
