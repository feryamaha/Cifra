'use client';

import { Card } from '@/components/ui/Card';
import type { SectionCardProps } from '@/types/song/song-view.types';

export function SectionCard({ section, viewType, onChordClick }: SectionCardProps) {
  const showChords = viewType !== 'lyrics';
  const showLyrics = viewType !== 'chords-only';

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-8 items-center justify-center rounded-full border border-primary-800 bg-primary-950 font-mono text-xs font-bold text-primary-300">
          {section.tag}
        </span>
        <h2 className="font-chakra text-sm font-semibold uppercase tracking-wide text-neutral-900">
          {section.name}
        </h2>
        {section.annotation && (
          <span className="ml-auto text-right text-xs italic text-neutral-500">
            {section.annotation}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {section.lines.map((line, li) => (
          <div key={li} className="flex flex-wrap items-end gap-y-3">
            {line.parts.map((part, pi) => {
              const chord = part.chord;
              return (
                <span key={pi} className="inline-flex flex-col">
                  {showChords &&
                    (chord && part.display ? (
                      <button
                        type="button"
                        onClick={() => onChordClick(chord)}
                        className="w-fit cursor-pointer rounded px-0.5 text-left font-mono text-[0.9em] font-bold leading-tight text-primary-300 transition-colors hover:bg-primary-950 hover:text-primary-200"
                        title="Ver shape"
                      >
                        {part.display}
                      </button>
                    ) : (
                      <span className="h-[1.2em]" />
                    ))}
                  {showLyrics && (
                    <span className="whitespace-pre leading-snug text-neutral-900">
                      {part.text || '\u00A0'}
                    </span>
                  )}
                  {viewType === 'chords-only' && <span className="w-3" />}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
