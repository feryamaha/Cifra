'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { safeCallbackUrl } from '@/lib/security/safe-redirect';
import { cn } from '@/lib/utils';

/**
 * Card de login. Nunca exibe nomes de variáveis de ambiente, paths de config
 * ou estado de provedores OAuth internos — só UI de produto.
 */
export function LoginCard({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = safeCallbackUrl(search.get('callbackUrl'), '/');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        // mensagem genérica: não distingue "usuário inexistente" vs "senha errada"
        setError('Não foi possível entrar. Verifique e-mail e senha.');
        setBusy(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Não foi possível entrar. Tente novamente em instantes.');
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-5 p-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-400">Conta</p>
        <h1 className="font-chakra text-2xl font-bold text-neutral-900">Entrar</h1>
        <p className="mt-1 text-sm text-neutral-700">
          Navegue e leia cifras sem login. Entre só para enviar cifras e acompanhar a moderação.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3" autoComplete="on">
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
          <span className="text-neutral-500">Senha</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2 text-neutral-900 outline-none focus:border-primary-400"
          />
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-auxiliary-danger-border bg-auxiliary-danger-background px-3 py-2 text-sm text-auxiliary-danger-default"
          >
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
          {busy ? 'Entrando…' : 'Entrar com e-mail'}
        </button>
      </form>

      {/* Só renderiza se o servidor confirmou provedor ativo — sem texto de configuração */}
      {googleEnabled ? (
        <>
          <div className="relative py-1 text-center text-[11px] text-neutral-500">
            <span className="bg-secondary-900 px-2 relative z-10">ou</span>
            <span className="absolute left-0 right-0 top-1/2 h-px bg-stroke-100" aria-hidden />
          </div>
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full rounded-lg border border-stroke-200 bg-secondary-800 py-2.5 text-sm text-neutral-900 hover:border-primary-400"
          >
            Entrar com Google
          </button>
        </>
      ) : null}

      <div className="flex flex-col gap-1 text-center text-sm text-neutral-700">
        <Link href="/esqueci-senha" className="text-primary-400 hover:text-primary-300">
          Esqueci minha senha
        </Link>
        <p>
          Não tem uma conta?{' '}
          <Link href="/cadastrar" className="font-semibold text-primary-400 hover:text-primary-300">
            Cadastre-se
          </Link>
        </p>
      </div>
    </Card>
  );
}
