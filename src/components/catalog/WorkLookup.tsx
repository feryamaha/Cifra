'use client';

import { useEffect, useState } from 'react';

type WorkHit = {
  artist: string;
  title: string;
  slug: string;
  versions: { slug: string; label: string | null }[];
};

export function WorkLookup({
  artist,
  title,
}: {
  artist: string;
  title: string;
  onPick?: (work: WorkHit) => void;
}) {
  const [hits, setHits] = useState<WorkHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = `${artist} ${title}`.trim();
    if (q.length < 3) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/works?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { works?: WorkHit[] };
        setHits(data.works ?? []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [artist, title]);

  if (!artist.trim() && !title.trim()) return null;

  const exact = hits.find(
    (w) =>
      w.artist.toLowerCase() === artist.trim().toLowerCase() &&
      w.title.toLowerCase() === title.trim().toLowerCase(),
  );

  return (
    <div className="space-y-2 rounded-lg border border-stroke-100 bg-secondary-900/50 p-3 text-sm">
      {loading && <p className="text-xs text-neutral-500">Buscando no catálogo…</p>}
      {exact ? (
        <div className="space-y-1">
          <p className="font-semibold text-primary-300">Esta música já existe no acervo.</p>
          <p className="text-xs text-neutral-500">
            Você pode enviar uma <strong className="text-neutral-700">nova versão</strong>. Versões
            no catálogo: {exact.versions.length || 0}.
          </p>
        </div>
      ) : hits.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs text-neutral-500">Obras parecidas:</p>
          <ul className="space-y-1">
            {hits.slice(0, 5).map((w) => (
              <li key={w.slug} className="text-xs text-neutral-700">
                {w.artist} · {w.title}{' '}
                <span className="text-neutral-500">({w.versions.length} versões)</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading &&
        artist.trim() &&
        title.trim() && (
          <p className="text-xs text-neutral-500">Obra nova: será criada na moderação.</p>
        )
      )}
    </div>
  );
}
