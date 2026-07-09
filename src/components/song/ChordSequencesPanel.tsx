import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ControlLabel } from '@/components/ui/ControlLabel';
import type { SongControlsProps } from '@/types/song/song-view.types';

export function ChordSequencesPanel({ view }: SongControlsProps) {
  if (view.chordSequences.length === 0) return null;

  return (
    <Card className="space-y-3">
      <ControlLabel>Sequências de acordes</ControlLabel>
      {view.chordSequences.map((seq) => (
        <div key={seq.name} className="rounded-lg border border-stroke-100 bg-secondary-900/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-chakra text-xs font-semibold text-primary-300">{seq.name}</span>
            <span className="text-[10px] text-neutral-500">{seq.sections.join(' · ')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {seq.chords.map((chord, i) => (
              <Badge key={`${chord}-${i}`} variant="amber">
                {chord}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
