'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdsFlank } from '@/components/ads/AdsFlank';
import { Card } from '@/components/ui/Card';
import { clearVisitHistory, loadVisitHistory, type VisitEntry } from '@/lib/history/visit-history';

export default function HistoryPage() {
  const [entries, setEntries] = useState<VisitEntry[]>([]);

  useEffect(() => {
    setEntries(loadVisitHistory());
  }, []);

  return (
    <AdsFlank>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-chakra text-3xl font-bold">Histórico</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Visitas neste navegador (sessionStorage). Contas autenticadas também gravam no
              servidor.
            </p>
          </div>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearVisitHistory();
                setEntries([]);
              }}
              className="rounded-lg border border-stroke-200 px-3 py-1.5 text-xs"
            >
              Limpar
            </button>
          )}
        </div>
        {entries.length === 0 ? (
          <Card className="p-6 text-center text-sm text-neutral-500">Nenhuma visita ainda.</Card>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li key={e.slug + e.visitedAt}>
                <Link href={`/musica/${encodeURIComponent(e.slug)}`}>
                  <Card className="p-4 hover:border-primary-500">
                    <p className="font-chakra font-semibold">{e.title}</p>
                    <p className="text-sm text-neutral-600">{e.artist}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdsFlank>
  );
}
