import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MySubmissionsClient } from '@/components/account/MySubmissionsClient';
import { auth } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

export default async function ContaEnviosPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/entrar?como=user&callbackUrl=${encodeURIComponent('/conta/envios')}`);
  }

  return (
    <div className="mx-auto max-w-[960px] px-3 py-10 @Desktop:px-4">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">Conta</p>
        <h1 className="font-chakra text-3xl font-bold text-neutral-900">Meus envios</h1>
        <p className="mt-2 text-sm text-neutral-700">
          Status das cifras que você enviou e mensagens de moderação.
        </p>
        <Link href="/adicionar" className="mt-3 inline-block text-sm text-primary-400">
          Enviar nova cifra
        </Link>
      </div>
      <MySubmissionsClient />
    </div>
  );
}
