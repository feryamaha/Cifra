'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  blocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  sentCount: number;
  approvedCount: number;
  rejectedCount: number;
  revisionTotal: number;
};

export function AdminUsersTable() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notifyId, setNotifyId] = useState<string | null>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    if (!res.ok) {
      setError('Não foi possível carregar usuários.');
      return;
    }
    const data = (await res.json()) as { users?: UserRow[] };
    setUsers(data.users ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, body: object) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(d?.error ?? 'Falha.');
        return;
      }
      setNotifyId(null);
      setNotifyTitle('');
      setNotifyBody('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Falha ao excluir.');
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-stroke-100">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-stroke-100 bg-secondary-900/70 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Último login</th>
              <th className="px-3 py-2">Enviadas</th>
              <th className="px-3 py-2">Aprovadas</th>
              <th className="px-3 py-2">Reprovadas</th>
              <th className="px-3 py-2">Edições</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stroke-100/60 last:border-0">
                <td className="px-3 py-2 text-neutral-900">{u.name || '-'}</td>
                <td className="px-3 py-2 text-neutral-700">{u.email}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR') : '-'}
                </td>
                <td className="px-3 py-2">{u.sentCount}</td>
                <td className="px-3 py-2">{u.approvedCount}</td>
                <td className="px-3 py-2">{u.rejectedCount}</td>
                <td className="px-3 py-2">{u.revisionTotal}</td>
                <td className="px-3 py-2">
                  {u.blocked ? (
                    <Badge variant="warning">bloqueado</Badge>
                  ) : (
                    <Badge variant="amber">ativo</Badge>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(u.id, { action: u.blocked ? 'unblock' : 'block' })}
                      className="rounded border border-stroke-200 px-2 py-1 text-[11px] hover:border-primary-400"
                    >
                      {u.blocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setNotifyId(u.id)}
                      className="rounded border border-stroke-200 px-2 py-1 text-[11px] hover:border-primary-400"
                    >
                      Notificar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(u.id)}
                      className="rounded border border-auxiliary-danger-border px-2 py-1 text-[11px] text-auxiliary-danger-default"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notifyId && (
        <div className="fixed inset-0 z-drawer flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md space-y-3 p-5">
            <h3 className="font-chakra text-lg font-bold text-neutral-900">Notificar usuário</h3>
            <input
              value={notifyTitle}
              onChange={(e) => setNotifyTitle(e.target.value)}
              placeholder="Título"
              maxLength={120}
              className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
            />
            <textarea
              value={notifyBody}
              onChange={(e) => setNotifyBody(e.target.value)}
              placeholder="Mensagem"
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNotifyId(null)}
                className="flex-1 rounded-lg border border-stroke-200 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy || !notifyTitle.trim() || !notifyBody.trim()}
                onClick={() =>
                  act(notifyId, {
                    action: 'notify',
                    title: notifyTitle.trim(),
                    body: notifyBody.trim(),
                  })
                }
                className={cn(
                  'flex-1 rounded-lg bg-primary-400 py-2 text-sm font-semibold text-secondary-950',
                  'disabled:opacity-50',
                )}
              >
                Enviar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
