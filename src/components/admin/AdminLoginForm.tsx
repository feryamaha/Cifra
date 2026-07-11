'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { safeCallbackUrl } from '@/lib/security/safe-redirect';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'Falha no login.');
        return;
      }
      const dest = safeCallbackUrl(searchParams.get('de'), '/admin');
      router.push(dest);
      router.refresh();
    } catch {
      setError('Servidor indisponível.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Usuário admin
        </span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          placeholder="Usuário"
        />
      </label>
      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Senha
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          placeholder="Senha"
        />
      </label>
      {error && (
        <p className="rounded-lg border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !username || !password}
        className="w-full rounded-xl bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950 hover:bg-primary-300 disabled:opacity-50"
      >
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
