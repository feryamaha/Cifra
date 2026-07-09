import { Badge } from '@/components/ui/Badge';
import type { SongHeaderProps } from '@/types/song/song-view.types';

export function SongHeader({ view }: SongHeaderProps) {
  const { song } = view;

  return (
    <header className="mb-6">
      <h1 className="font-chakra text-3xl font-bold text-neutral-900">{song.title}</h1>
      <p className="mt-1 text-neutral-700">{song.artist}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="amber">Tom: {view.currentKeyName}</Badge>
        {view.capo > 0 && (
          <Badge variant="warning">
            Capo: traste {view.capo} · shapes de {view.shapeKeyName}
          </Badge>
        )}
        <Badge>BPM: {song.bpm}</Badge>
        <Badge>{song.timeSignature}</Badge>
        <Badge variant="info">{view.tuning.label}</Badge>
        {view.notation === 'numbers' && <Badge variant="success">Números da escala</Badge>}
        {view.simplified && <Badge variant="success">Simplificada</Badge>}
      </div>
    </header>
  );
}
