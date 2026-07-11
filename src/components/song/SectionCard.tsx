'use client';

import { ChordHover } from '@/components/music/ChordHover';
import { Card } from '@/components/ui/Card';
import { ChordDiagram } from '@/components/ui/ChordDiagram';
import { cn } from '@/lib/utils';
import type { SectionCardProps } from '@/types/song/song-view.types';

export function SectionCard({
  section,
  viewType,
  selectedChord,
  tuning,
  resolveVoicing,
  resolveVoicings,
  onChordClick,
  lefty = false,
  inlineDiagrams = false,
}: SectionCardProps) {
  const showChords = viewType !== 'lyrics';
  const showLyrics = viewType !== 'chords-only';

  return (
    <Card className="overflow-visible rounded-2xl border-stroke-200 shadow-10 transition-colors hover:border-primary-800">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary-700 bg-primary-950 font-mono text-[10px] font-bold text-primary-300">
          {section.tag.slice(0, 3)}
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
              const multi = chord ? resolveVoicings(chord) : null;
              const voicing = chord
                ? (resolveVoicing(chord)?.voicing ?? multi?.voicings[0] ?? null)
                : null;
              return (
                <span key={pi} className="inline-flex flex-col">
                  {showChords &&
                    (chord && part.display ? (
                      <ChordHover
                        symbol={chord}
                        display={part.display}
                        voicing={voicing}
                        variations={multi?.voicings ?? []}
                        tuning={tuning}
                        active={selectedChord === chord}
                        onSelect={onChordClick}
                      />
                    ) : (
                      <span className="h-[1.2em]" />
                    ))}
                  {showLyrics && (
                    <span className="whitespace-pre leading-snug text-neutral-900">
                      {part.text || '\u00A0'}
                    </span>
                  )}
                  {viewType === 'chords-only' && <span className="w-3" />}
                  {inlineDiagrams && voicing && (
                    <span className={cn('mt-1', lefty && 'scale-x-[-1]')}>
                      <ChordDiagram
                        voicing={voicing}
                        tuning={tuning}
                        label={part.display ?? ''}
                        size="sm"
                      />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
