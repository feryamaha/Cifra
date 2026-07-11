'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

type Comment = { id: string; text: string; userName?: string | null; createdAt: string };

export function CommentSection({ songSlug }: { songSlug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const res = await fetch(`/api/songs/${encodeURIComponent(songSlug)}/comments`);
    const data = (await res.json()) as { comments?: Comment[] };
    setComments(data.comments ?? []);
  };

  useEffect(() => {
    void fetch(`/api/songs/${encodeURIComponent(songSlug)}/comments`)
      .then((r) => r.json())
      .then((data: { comments?: Comment[] }) => setComments(data.comments ?? []));
  }, [songSlug]);

  const send = async () => {
    if (!text.trim()) return;
    const res = await fetch(`/api/songs/${encodeURIComponent(songSlug)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    });
    if (res.ok) {
      setText('');
      setMsg('Enviado para moderação.');
      void load();
    } else {
      setMsg('Faça login para comentar.');
    }
  };

  return (
    <Card className="mt-8 space-y-4 p-5">
      <h2 className="font-chakra text-lg font-semibold">Comentários</h2>
      {session?.user ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
            placeholder="Seu comentário…"
          />
          <button
            type="button"
            onClick={send}
            className="self-end rounded-lg bg-primary-400 px-4 py-2 text-sm font-semibold text-secondary-950"
          >
            Enviar
          </button>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Entre para comentar.</p>
      )}
      {msg && <p className="text-xs text-neutral-500">{msg}</p>}
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border-t border-stroke-100 pt-3 text-sm">
            <p className="font-medium text-neutral-800">{c.userName ?? 'Usuário'}</p>
            <p className="text-neutral-700">{c.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
