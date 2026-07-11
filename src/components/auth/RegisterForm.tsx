'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (!res.ok) {
        setError(data?.error ?? 'Não foi possível criar a conta.');
        setBusy(false);
        return;
      }
      // tenta login; se e-mail já existia, falha de forma genérica
      const login = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/',
      });
      if (login?.error) {
        setError(
          'Se a conta for nova, tente entrar. Se já existia, use e-mail e senha corretos ou recupere a senha.',
        );
        setBusy(false);
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Servidor indisponível.');
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-5 p-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-400">Conta</p>
        <h1 className="font-chakra text-2xl font-bold text-neutral-900">Cadastre-se</h1>
        <p className="mt-1 text-sm text-neutral-700">
          Crie uma conta para enviar cifras à moderação do Cifra Tom.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="text-neutral-500">Nome</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-neutral-900 outline-none focus:border-primary-400"
          />
        </label>
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
        <label className="block space-y-1 text-sm">
          <span className="text-neutral-500">Senha (mín. 8 caracteres)</span>
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-neutral-900 outline-none focus:border-primary-400"
          />
        </label>
        {error && (
          <p className="rounded-md border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default">
            {error}
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
          {busy ? 'Criando…' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-700">
        Já tem conta?{' '}
        <Link
          href="/entrar?como=user"
          className="font-semibold text-primary-400 hover:text-primary-300"
        >
          Entrar como usuário
        </Link>
      </p>
    </Card>
  );
}
