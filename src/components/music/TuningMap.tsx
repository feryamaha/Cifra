'use client';

/**
 * TuningMap: mostra como as cordas soltas mudam ao trocar afinação.
 * Só o mapa de cordas — shapes ficam no hover da cifra, não aqui.
 */

import { ControlLabel } from '@/components/ui/ControlLabel';
import { STANDARD_TUNING } from '@/data/music/tunings.data';
import { cn } from '@/lib/utils';
import type { Tuning } from '@/types/music/tunings.types';

export interface TuningMapProps {
  tuning: Tuning;
  compareTo?: Tuning;
  className?: string;
}

export function TuningMap({ tuning, compareTo = STANDARD_TUNING, className }: TuningMapProps) {
  const isStandard = tuning.id === compareTo.id;

  return (
    <div className={cn('space-y-2', className)}>
      <ControlLabel>Mapa da afinação</ControlLabel>

      <div className="rounded-lg border border-stroke-100 bg-secondary-900/50 p-3">
        <div className="mb-2 flex items-center justify-between gap-1">
          {[6, 5, 4, 3, 2, 1].map((n) => (
            <span
              key={n}
              className="flex h-5 w-full items-center justify-center font-mono text-[9px] text-neutral-500"
            >
              {n}ª
            </span>
          ))}
        </div>

        {!isStandard && (
          <>
            <div className="mb-1.5 flex gap-1">
              {compareTo.stringNames.map((name, i) => (
                <span
                  key={`ref-${i}`}
                  className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-md border border-stroke-200 bg-secondary-800 font-mono text-xs font-semibold text-neutral-700 opacity-50"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="mb-1.5 flex items-center justify-center text-primary-500">
              <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
                <path
                  d="M8 12 L8 0 M3 5 L8 0 L13 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </>
        )}

        <div className="flex gap-1">
          {tuning.stringNames.map((name, i) => {
            const changed = !isStandard && name !== compareTo.stringNames[i];
            return (
              <span
                key={`cur-${i}`}
                title={changed ? `${compareTo.stringNames[i]} → ${name}` : name}
                className={cn(
                  'flex h-8 min-w-0 flex-1 items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors duration-fast',
                  changed
                    ? 'border-primary-600 bg-primary-950 text-primary-300 shadow-glow-sm'
                    : 'border-stroke-200 bg-secondary-800 text-neutral-700',
                )}
              >
                {name}
              </span>
            );
          })}
        </div>

        <p className="mt-2 text-center font-mono text-[10px] text-neutral-500">
          {isStandard ? (
            tuning.label
          ) : (
            <>
              <span className="text-neutral-700">{compareTo.label.split(' ')[0]}</span>
              <span className="mx-1.5 text-primary-500">→</span>
              <span className="text-primary-300">{tuning.label}</span>
            </>
          )}
        </p>
        <p className="mt-1.5 text-center text-[10px] text-neutral-500">
          Os shapes na cifra se recalculam sozinhos: passe o mouse no acorde.
        </p>
      </div>
    </div>
  );
}
