'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdminInbox } from '@/components/admin/AdminInbox';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { type RejectionCategory, RejectVersionModal } from '@/components/admin/RejectVersionModal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { CatalogEntry } from '@/lib/server/song-store';
import { cn } from '@/lib/utils';

export type PendingVersion = {
  id: string;
  slug: string;
  label: string | null;
  createdAt: string | Date;
  workTitle: string;
  workArtist: string;
  payload: { title?: string; artist?: string; key?: string; genre?: string; chords?: string[] };
};

type Tab = 'moderacao' | 'usuarios' | 'mensagens';

export function AdminDashboard({
  songs,
  pendingVersions = [],
}: {
  songs: CatalogEntry[];
  pendingVersions?: PendingVersion[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('moderacao');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rejectTarget, setRejectTarget] = useState<PendingVersion | null>(null);

  const call = async (fn: () => Promise<Response>) => {
    setBusy(true);
    setError('');
    try {
      const res = await fn();
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'Falha na operação.');
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError('Servidor indisponível.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const approveVersion = (id: string) =>
    call(() =>
      fetch(`/api/admin/versions/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      }),
    );

  const submitReject = async (data: { category: RejectionCategory; reason: string }) => {
    if (!rejectTarget) return;
    const ok = await call(() =>
      fetch(`/api/admin/versions/${encodeURIComponent(rejectTarget.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          category: data.category,
          reason: data.reason,
        }),
      }),
    );
    if (ok) setRejectTarget(null);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/entrar');
    router.refresh();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'moderacao', label: 'Moderação' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'mensagens', label: 'Mensagens' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-stroke-200 bg-secondary-900 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-md px-3 py-1.5 font-chakra text-sm transition-colors',
                tab === t.id
                  ? 'bg-primary-400 font-semibold text-secondary-950'
                  : 'text-neutral-700 hover:text-neutral-900',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-stroke-200 bg-secondary-800 px-3 py-1.5 text-xs text-neutral-700 hover:border-primary-500"
        >
          Sair do admin
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
          {error}
        </p>
      )}

      {tab === 'moderacao' && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Fila de revisão ({pendingVersions.length})
            </h2>
            {pendingVersions.length === 0 ? (
              <p className="rounded-xl border border-stroke-100 bg-secondary-900/50 px-4 py-6 text-center text-sm text-neutral-500">
                Nenhuma versão pendente.
              </p>
            ) : (
              <div className="grid gap-3 @tablet:grid-cols-2">
                {pendingVersions.map((v) => (
                  <Card key={v.id} className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="warning">pending_review</Badge>
                      {v.payload.key && <Badge variant="amber">Tom: {v.payload.key}</Badge>}
                    </div>
                    <h3 className="font-chakra text-base font-semibold text-neutral-900">
                      {v.workTitle}
                    </h3>
                    <p className="text-sm text-neutral-700">{v.workArtist}</p>
                    <p className="font-mono text-[11px] text-primary-400/90 line-clamp-1">
                      {(v.payload.chords ?? []).slice(0, 10).join(' · ')}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => approveVersion(v.id)}
                        className="flex-1 rounded-lg bg-primary-400 py-2 text-xs font-semibold text-secondary-950 hover:bg-primary-300 disabled:opacity-50"
                      >
                        Publicar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setRejectTarget(v)}
                        className="flex-1 rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background py-2 text-xs font-medium text-auxiliary-danger-default hover:brightness-125 disabled:opacity-50"
                      >
                        Rejeitar + motivo
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Catálogo ({songs.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-stroke-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stroke-100 bg-secondary-900/70 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    <th className="px-3 py-2.5">Música</th>
                    <th className="px-3 py-2.5">Artista</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.slug} className="border-b border-stroke-100/60 last:border-0">
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/musica/${song.slug}`}
                          className="font-medium text-neutral-900 hover:text-primary-300"
                        >
                          {song.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-neutral-700">{song.artist}</td>
                      <td className="px-3 py-2.5">
                        {song.published ? (
                          <Badge variant="amber">publicada</Badge>
                        ) : (
                          <Badge variant="warning">oculta</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {tab === 'usuarios' && (
        <section>
          <h2 className="mb-3 font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Usuários
          </h2>
          <AdminUsersTable />
        </section>
      )}

      {tab === 'mensagens' && (
        <section>
          <h2 className="mb-3 font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Mensagens dos usuários
          </h2>
          <AdminInbox />
        </section>
      )}

      <RejectVersionModal
        open={Boolean(rejectTarget)}
        versionTitle={rejectTarget ? `${rejectTarget.workArtist} · ${rejectTarget.workTitle}` : ''}
        busy={busy}
        onClose={() => setRejectTarget(null)}
        onSubmit={submitReject}
      />
    </div>
  );
}
