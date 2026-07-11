'use client';

/**
 * Faixa de acordes únicos com scroll horizontal.
 * min-w-0 no pai + overflow-x-auto + shrink-0 nos itens.
 */

import { ChordDiagram } from '@/components/ui/ChordDiagram';
import { ControlLabel } from '@/components/ui/ControlLabel';
import { cn } from '@/lib/utils';
import type { SongViewModel } from '@/types/song/song-view.types';

export interface ChordStripProps {
  view: SongViewModel;
}

export function ChordStrip({ view }: ChordStripProps) {
  if (view.uniqueChords.length === 0) return null;

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <ControlLabel className="mb-0">Acordes da música</ControlLabel>
        <span className="font-mono text-[10px] text-neutral-500">
          {view.uniqueChords.length} · deslize →
        </span>
      </div>
      <div
        className={cn(
          'flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-2',
          'scroll-smooth',
          /* scroll visível (não scrollbar-none) */
          '[-webkit-overflow-scrolling:touch]',
          '[scrollbar-width:thin]',
          '[scrollbar-color:theme(colors.primary.600)_theme(colors.secondary.800)]',
        )}
      >
        {view.uniqueChords.map((symbol) => {
          const multi = view.resolveVoicings(symbol);
          const resolved = view.resolveVoicing(symbol);
          const voicing = multi?.voicings[0] ?? resolved?.voicing;
          const label = multi?.label ?? resolved?.label ?? symbol;
          if (!voicing) return null;
          const active = view.selectedChord === symbol;
          return (
            <button
              key={symbol}
              type="button"
              onClick={() => view.selectChord(symbol)}
              className={cn(
                'w-[120px] shrink-0 rounded-xl border p-2 transition-all duration-normal ease-out',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
                active
                  ? 'border-primary-500 bg-primary-950/40 shadow-glow-sm'
                  : 'border-stroke-100 bg-secondary-900/50 hover:border-primary-700 hover:bg-secondary-800',
              )}
              aria-pressed={active}
              aria-label={`Selecionar acorde ${label}`}
            >
              <ChordDiagram
                voicing={voicing}
                tuning={view.tuning}
                label={label}
                size="sm"
                showFingers
                className="max-w-none w-full"
              />
              {multi && multi.voicings.length > 1 && (
                <p className="mt-1 text-center font-mono text-[9px] text-neutral-500">
                  +{multi.voicings.length - 1} var.
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
