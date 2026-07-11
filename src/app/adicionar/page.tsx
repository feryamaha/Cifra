import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AddSongForm } from '@/components/catalog/AddSongForm';
import { auth } from '@/lib/auth/auth';

export default async function AddSongPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/entrar?como=user&callbackUrl=${encodeURIComponent('/adicionar')}`);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-3 py-10 @Desktop:px-4">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">Cifras</p>
        <h1 className="font-chakra text-3xl font-bold text-neutral-900">Adicionar cifra</h1>
        <p className="mt-2 text-sm text-neutral-700">
          Logado como <strong>{session.user.email}</strong>. Cole no formato Cifra Club, ChordPro,
          ou envie <strong>.txt / .docx / .pdf</strong>. O envio <strong>não publica</strong>: vai
          para a fila de revisão do admin. Se a música já existir, envie uma nova versão.
        </p>
      </div>
      <Suspense
        fallback={<p className="py-10 text-center text-sm text-neutral-500">Carregando…</p>}
      >
        <AddSongForm />
      </Suspense>
    </div>
  );
}
