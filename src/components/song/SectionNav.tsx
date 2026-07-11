'use client';

import type { RenderedSection } from '@/types/song/song-view.types';

export function SectionNav({ sections }: { sections: RenderedSection[] }) {
  if (sections.length < 2) return null;
  return (
    <nav aria-label="Seções da cifra" className="mb-3 flex flex-wrap gap-1.5 print:hidden">
      {sections.map((section, i) => (
        <button
          key={section.id}
          type="button"
          onClick={() => {
            document.getElementById(`section-${section.id}`)?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
          className="flex h-8 min-w-8 items-center justify-center rounded-full border border-stroke-200 bg-secondary-800 px-2 font-mono text-[11px] text-primary-300 transition-colors hover:border-primary-500"
          title={section.name}
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );
}
