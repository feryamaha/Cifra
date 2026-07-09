import type { SongMapProps } from '@/types/song/song-view.types';

export function SongMap({ sections }: SongMapProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {sections.map((section, i) => (
        <div
          key={`${section.id}-${i}`}
          className="flex items-center gap-3 rounded-lg border border-stroke-100 bg-secondary-900/70 px-3 py-2"
        >
          <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded-full border border-primary-800 bg-primary-950 font-mono text-xs font-bold text-primary-300">
            {section.tag}
          </span>
          <div>
            <p className="text-sm text-neutral-900">{section.name}</p>
            {section.annotation && (
              <p className="text-xs italic text-neutral-500">{section.annotation}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
