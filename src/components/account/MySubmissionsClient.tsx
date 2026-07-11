'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { REJECTION_CATEGORY_LABELS } from '@/lib/moderation/labels';

type VersionRow = {
  id: string;
  slug: string;
  status: string;
  label: string | null;
  rejectionReason: string | null;
  rejectionCategory: string | null;
  createdAt: string;
  workTitle: string;
  workArtist: string;
};

type Notif = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type?: string;
  versionId?: string | null;
};

export function MySubmissionsClient() {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [error, setError] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgOk, setMsgOk] = useState('');
  const [appealFor, setAppealFor] = useState<string | null>(null);
  const [appealBody, setAppealBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [vRes, nRes] = await Promise.all([
        fetch('/api/versions'),
        fetch('/api/me/notifications'),
      ]);
      if (!vRes.ok) {
        setError('Faça login para ver seus envios.');
        return;
      }
      const vData = (await vRes.json()) as { versions?: VersionRow[] };
      const nData = (await nRes.json()) as { notifications?: Notif[] };
      setVersions(vData.versions ?? []);
      setNotifications(nData.notifications ?? []);
    } catch {
      setError('Não foi possível carregar.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusLabel = (s: string) => {
    if (s === 'pending_review') return 'Aguardando revisão';
    if (s === 'published') return 'Publicada';
    if (s === 'rejected') return 'Não publicada';
    return s;
  };

  const sendMessage = async (opts: {
    subject: string;
    body: string;
    kind?: string;
    relatedVersionId?: string;
  }) => {
    setBusy(true);
    setMsgOk('');
    setError('');
    try {
      const res = await fetch('/api/me/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(d?.error ?? 'Falha ao enviar mensagem.');
        return;
      }
      setMsgOk('Mensagem enviada ao admin.');
      setMsgSubject('');
      setMsgBody('');
      setAppealFor(null);
      setAppealBody('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
          {error}
        </p>
      )}
      {msgOk && (
        <p className="rounded-lg border border-auxiliary-success-border bg-auxiliary-success-background px-3 py-2 text-sm text-auxiliary-success-default">
          {msgOk}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Notificações
        </h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhuma mensagem ainda.</p>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="space-y-1">
              <p className="font-semibold text-neutral-900">{n.title}</p>
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{n.body}</p>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Mensagem ao admin
        </h2>
        <Card className="space-y-2">
          <input
            value={msgSubject}
            onChange={(e) => setMsgSubject(e.target.value)}
            placeholder="Assunto"
            maxLength={120}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
          />
          <textarea
            value={msgBody}
            onChange={(e) => setMsgBody(e.target.value)}
            placeholder="Sua mensagem"
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy || !msgSubject.trim() || !msgBody.trim()}
            onClick={() =>
              sendMessage({
                subject: msgSubject.trim(),
                body: msgBody.trim(),
                kind: 'general',
              })
            }
            className="rounded-lg bg-primary-400 px-3 py-2 text-sm font-semibold text-secondary-950 disabled:opacity-50"
          >
            Enviar ao admin
          </button>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-chakra text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Envios ({versions.length})
        </h2>
        {versions.length === 0 ? (
          <p className="text-sm text-neutral-500">Você ainda não enviou cifras.</p>
        ) : (
          versions.map((v) => (
            <Card key={v.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-chakra font-semibold text-neutral-900">
                  {v.workArtist} · {v.workTitle}
                </p>
                <Badge variant="amber">{statusLabel(v.status)}</Badge>
              </div>
              {v.status === 'rejected' && (
                <div className="space-y-2 rounded-md border border-auxiliary-warning-border bg-auxiliary-warning-background px-3 py-2 text-sm">
                  {v.rejectionCategory && (
                    <p className="font-semibold text-auxiliary-warning-default">
                      {REJECTION_CATEGORY_LABELS[v.rejectionCategory] ?? v.rejectionCategory}
                    </p>
                  )}
                  {v.rejectionReason && (
                    <p className="whitespace-pre-wrap text-neutral-900">{v.rejectionReason}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/adicionar?editarVersao=${encodeURIComponent(v.id)}`}
                      className="rounded-lg bg-primary-400 px-3 py-1.5 text-xs font-semibold text-secondary-950"
                    >
                      Editar e reenviar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAppealFor(v.id)}
                      className="rounded-lg border border-stroke-200 px-3 py-1.5 text-xs text-neutral-700"
                    >
                      Argumentar / responder
                    </button>
                  </div>
                  {appealFor === v.id && (
                    <div className="space-y-2 pt-2">
                      <textarea
                        value={appealBody}
                        onChange={(e) => setAppealBody(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        placeholder="Sua argumentação ao admin…"
                        className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        disabled={busy || appealBody.trim().length < 5}
                        onClick={() =>
                          sendMessage({
                            subject: `Argumentação: ${v.workTitle}`,
                            body: appealBody.trim(),
                            kind: 'rejection_appeal',
                            relatedVersionId: v.id,
                          })
                        }
                        className="rounded-lg bg-primary-400 px-3 py-1.5 text-xs font-semibold text-secondary-950 disabled:opacity-50"
                      >
                        Enviar argumentação
                      </button>
                    </div>
                  )}
                </div>
              )}
              {(v.status === 'pending_review' || v.status === 'published') && (
                <Link
                  href={`/adicionar?editarVersao=${encodeURIComponent(v.id)}`}
                  className="inline-block text-xs text-primary-400 hover:text-primary-300"
                >
                  Editar (reenvio para revisão)
                </Link>
              )}
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
