import Link from 'next/link';
import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const dynamic = 'force-dynamic';

/**
 * Login exclusivo de ADMIN (cookie HMAC + senha de ambiente).
 * Não usa conta de usuário do site.
 */
export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">Admin</p>
      <h1 className="font-chakra text-2xl font-bold text-neutral-900">Entrar como administrador</h1>
      <p className="mt-2 text-sm text-neutral-700">
        Acesso isolado ao painel de moderação. Contas de usuário do site não entram por aqui.
      </p>
      <Suspense>
        <AdminLoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-neutral-500">
        <Link href="/entrar" className="text-primary-400 hover:text-primary-300">
          ← Voltar ao login (usuário ou admin)
        </Link>
      </p>
    </div>
  );
}
