'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;
      // mesma UX para sucesso e rate limit genérico
      setMessage(
        data?.message ??
          data?.error ??
          'Se existir uma conta com este e-mail, você receberá instruções para redefinir a senha.',
      );
    } catch {
      setMessage(
        'Se existir uma conta com este e-mail, você receberá instruções para redefinir a senha.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-3 py-12 @Desktop:px-4">
      <Card className="mx-auto max-w-md space-y-4 p-6">
        <div>
          <h1 className="font-chakra text-2xl font-bold text-neutral-900">Esqueci minha senha</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Informe o e-mail da conta. Por segurança, não confirmamos se o e-mail está cadastrado.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="text-neutral-500">E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-neutral-900 outline-none focus:border-primary-400"
            />
          </label>
          {message && (
            <p className="rounded-md border border-stroke-200 bg-secondary-900/60 px-3 py-2 text-sm text-neutral-700">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className={cn(
              'w-full rounded-lg bg-primary-400 py-2.5 font-chakra text-sm font-semibold text-secondary-950',
              'hover:bg-primary-300 disabled:opacity-60',
            )}
          >
            {busy ? 'Enviando…' : 'Enviar instruções'}
          </button>
        </form>
        <Link
          href="/entrar?como=user"
          className="inline-block text-sm font-semibold text-primary-400"
        >
          Voltar ao login de usuário
        </Link>
      </Card>
    </div>
  );
}
