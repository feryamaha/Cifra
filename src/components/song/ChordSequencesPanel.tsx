'use client';

import { ChordHover } from '@/components/music/ChordHover';
import { Card } from '@/components/ui/Card';
import { ControlLabel } from '@/components/ui/ControlLabel';
import { nameToPc } from '@/lib/music/notes';
import { renderChord } from '@/lib/music/transform';
import type { SongControlsProps } from '@/types/song/song-view.types';

export function ChordSequencesPanel({ view }: SongControlsProps) {
  if (view.chordSequences.length === 0) return null;

  const originalKeyPc = nameToPc(view.song.originalKey) ?? 0;
  const opts = {
    transpose: view.transpose,
    capo: view.capo,
    notation: view.notation,
    simplified: view.simplified,
    accidentalStyle: 'flat' as const,
  };

  return (
    <Card className="min-w-0 space-y-3 overflow-visible animate-slide-up">
      <div className="space-y-0.5">
        <ControlLabel>Progressões de acordes</ControlLabel>
        <p className="text-[11px] text-neutral-500">
          Padrões que se repetem na música (ciclo harmônico por seção).
        </p>
      </div>
      {view.chordSequences.map((seq) => (
        <div
          key={seq.name}
          className="rounded-lg border border-stroke-100 bg-secondary-900/50 p-3 transition-colors hover:border-stroke-200"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-chakra text-xs font-semibold text-primary-300">{seq.name}</span>
            <span className="truncate text-[10px] text-neutral-500">
              {seq.sections.join(' · ')}
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {seq.chords.map((chord, i) => {
              const multi = view.resolveVoicings(chord);
              const rendered = renderChord(chord, originalKeyPc, opts);
              const display = rendered?.display ?? chord;
              return (
                <ChordHover
                  key={`${chord}-${i}`}
                  symbol={chord}
                  display={display}
                  voicing={multi?.voicings[0] ?? view.resolveVoicing(chord)?.voicing ?? null}
                  variations={multi?.voicings ?? []}
                  tuning={view.tuning}
                  active={view.selectedChord === chord}
                  onSelect={view.selectChord}
                  trigger="badge"
                />
              );
            })}
          </div>
        </div>
      ))}
    </Card>
  );
}
