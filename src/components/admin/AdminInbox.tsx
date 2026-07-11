'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

type Msg = {
  id: string;
  subject: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
  fromName: string | null;
  fromEmail: string;
  relatedVersionId: string | null;
};

export function AdminInbox() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/messages');
    if (!res.ok) {
      setError('Falha ao carregar mensagens.');
      return;
    }
    const data = (await res.json()) as { messages?: Msg[] };
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    });
    await load();
  };

  if (error) {
    return <p className="text-sm text-auxiliary-danger-default">{error}</p>;
  }

  if (messages.length === 0) {
    return <p className="text-sm text-neutral-500">Nenhuma mensagem de usuários.</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <Card key={m.id} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {!m.read && <Badge variant="warning">nova</Badge>}
            {m.kind === 'rejection_appeal' && <Badge variant="amber">argumentação</Badge>}
            <span className="font-chakra font-semibold text-neutral-900">{m.subject}</span>
          </div>
          <p className="text-xs text-neutral-500">
            {m.fromName || '-'} · {m.fromEmail} · {new Date(m.createdAt).toLocaleString('pt-BR')}
          </p>
          <p className="whitespace-pre-wrap text-sm text-neutral-700">{m.body}</p>
          {!m.read && (
            <button
              type="button"
              onClick={() => markRead(m.id)}
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              Marcar como lida
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}
