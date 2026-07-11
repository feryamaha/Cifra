'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

type Fav = { id: string; songSlug: string; createdAt: string };
type Col = { id: string; name: string };

export function FavoritesClient() {
  const [favorites, setFavorites] = useState<Fav[]>([]);
  const [collections, setCollections] = useState<Col[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [f, c] = await Promise.all([
      fetch('/api/me/favorites').then((r) => r.json()),
      fetch('/api/me/collections').then((r) => r.json()),
    ]);
    setFavorites(f.favorites ?? []);
    setCollections(c.collections ?? []);
  };

  useEffect(() => {
    void (async () => {
      const [f, c] = await Promise.all([
        fetch('/api/me/favorites').then((r) => r.json()),
        fetch('/api/me/collections').then((r) => r.json()),
      ]);
      setFavorites(f.favorites ?? []);
      setCollections(c.collections ?? []);
    })();
  }, []);

  const addCollection = async () => {
    if (!name.trim()) return;
    const res = await fetch('/api/me/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) {
      setMsg('Não foi possível criar (db:push?).');
      return;
    }
    setName('');
    void load();
  };

  return (
    <div className="mt-8 space-y-6">
      {msg && <p className="text-sm text-auxiliary-danger-default">{msg}</p>}
      <section>
        <h2 className="mb-2 font-chakra text-sm font-semibold uppercase text-neutral-500">
          Coleções
        </h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da coleção"
            className="flex-1 rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCollection}
            className="rounded-lg bg-primary-400 px-3 py-2 text-sm font-semibold text-secondary-950"
          >
            Criar
          </button>
        </div>
        <ul className="mt-3 space-y-1 text-sm">
          {collections.map((c) => (
            <li key={c.id} className="text-neutral-700">
              {c.name}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-chakra text-sm font-semibold uppercase text-neutral-500">
          Favoritos
        </h2>
        {favorites.length === 0 ? (
          <Card className="p-4 text-sm text-neutral-500">
            Nenhum favorito. Use o botão na página da cifra (quando logado).
          </Card>
        ) : (
          <ul className="space-y-2">
            {favorites.map((f) => (
              <li key={f.id}>
                <Link href={`/musica/${encodeURIComponent(f.songSlug)}`}>
                  <Card className="p-3 text-sm hover:border-primary-500">{f.songSlug}</Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
