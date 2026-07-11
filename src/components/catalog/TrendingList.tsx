'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

type Item = { slug: string; title: string; artist: string; views: number };

export function TrendingList() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    void fetch('/api/songs/trending')
      .then((r) => r.json())
      .then((d: { trending?: Item[] }) => setItems(d.trending ?? []));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
        Em alta
      </h2>
      <div className="grid gap-2 @tablet:grid-cols-2 @Desktop:grid-cols-3">
        {items.slice(0, 6).map((t, i) => (
          <Link key={t.slug} href={`/musica/${t.slug}`}>
            <Card className="flex items-center gap-3 p-3 hover:border-primary-500">
              <span className="font-mono text-lg font-bold text-primary-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900">{t.title}</p>
                <p className="truncate text-xs text-neutral-600">{t.artist}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
