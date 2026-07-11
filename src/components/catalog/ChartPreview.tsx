'use client';

/**
 * Preview monoespaçado da cifra (acorde em cima da sílaba).
 */

import type { SongDraft } from '@/lib/parsers';

export function ChartPreview({ draft }: { draft: SongDraft }) {
  if (draft.sections.length === 0) {
    return <p className="text-sm text-neutral-500">Nenhuma seção parseada.</p>;
  }

  return (
    <div className="max-h-[55vh] space-y-5 overflow-y-auto font-mono text-[13px] leading-tight">
      {draft.sections.map((sec) => (
        <div key={sec.id}>
          <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-primary-400">
            {sec.tag} · {sec.name}
          </p>
          {sec.lines.map((line, li) => (
            <div key={li} className="mb-2.5">
              {/* linha de acordes */}
              <div className="flex flex-wrap whitespace-pre text-primary-300">
                {line.parts.map((part, pi) => (
                  <span key={`c-${pi}`} className="inline-flex flex-col">
                    <span className="min-h-[1.1em] font-bold">{part.chord ?? '\u00A0'}</span>
                  </span>
                ))}
              </div>
              {/* linha de letra — monoespaçada alinhada */}
              <div className="flex flex-wrap whitespace-pre text-neutral-900">
                {line.parts.map((part, pi) => (
                  <span key={`l-${pi}`}>{part.text || '\u00A0'}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Preview simples só de sequência de acordes */
export function ChordsOnlyPreview({ chords }: { chords: string[] }) {
  if (chords.length === 0) {
    return <p className="text-sm text-neutral-500">Nenhum acorde.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {chords.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="rounded-md bg-primary-950 px-2 py-1 font-mono text-sm font-bold text-primary-300"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
