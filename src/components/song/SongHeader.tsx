import { Badge } from '@/components/ui/Badge';
import type { SongHeaderProps } from '@/types/song/song-view.types';

/**
 * Cabeçalho público da cifra.
 * Só metadados musicais: Tom, compasso (tempo), afinação e BPM (se houver).
 * Sem badges de origem, admin, publicação ou status de backend.
 */
export function SongHeader({ view }: SongHeaderProps) {
  const { song } = view;

  return (
    <header className="mb-6 animate-slide-up">
      <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-primary-500">
        Cifra Tom
      </p>
      <h1 className="font-chakra text-3xl font-bold tracking-tight text-neutral-900 text-balance @tablet:text-4xl">
        {song.title}
      </h1>
      <p className="mt-1.5 text-lg text-neutral-700">{song.artist}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="amber">Tom: {view.currentKeyName}</Badge>
        <Badge>{song.timeSignature}</Badge>
        <Badge variant="info">{view.tuning.label}</Badge>
        {song.bpm != null && song.bpm > 0 && <Badge variant="neutral">BPM: {song.bpm}</Badge>}
      </div>
    </header>
  );
}
