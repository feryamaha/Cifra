import Link from 'next/link';
import { Suspense } from 'react';
import { LoginCard } from '@/components/auth/LoginCard';
import { Card } from '@/components/ui/Card';
import { safeCallbackUrl } from '@/lib/security/safe-redirect';

/** Hub: apenas User | Admin (sem descrição de função). */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ como?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const isUserForm = params.como === 'user';
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  const userHref = (() => {
    const q = new URLSearchParams();
    q.set('como', 'user');
    const cb = safeCallbackUrl(params.callbackUrl, '');
    if (cb) q.set('callbackUrl', cb);
    return `/entrar?${q.toString()}`;
  })();

  if (isUserForm) {
    return (
      <div className="mx-auto max-w-[1440px] px-3 py-12 @Desktop:px-4">
        <p className="mb-4 text-center text-sm text-neutral-500">
          <Link href="/entrar" className="text-primary-400 hover:text-primary-300">
            ← Voltar
          </Link>
        </p>
        <Suspense fallback={<p className="text-center text-sm text-neutral-500">Carregando…</p>}>
          <LoginCard googleEnabled={googleEnabled} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-3 py-12 @Desktop:px-4">
      <h1 className="mb-6 text-center font-chakra text-3xl font-bold text-neutral-900">Entrar</h1>
      <div className="grid gap-3">
        <Link href={userHref}>
          <Card className="cursor-pointer p-6 text-center transition-all hover:border-primary-400 hover:shadow-glow-sm">
            <p className="font-chakra text-xl font-semibold text-neutral-900">User</p>
          </Card>
        </Link>
        <Link href="/admin/login">
          <Card className="cursor-pointer p-6 text-center transition-all hover:border-primary-400 hover:shadow-glow-sm">
            <p className="font-chakra text-xl font-semibold text-neutral-900">Admin</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
