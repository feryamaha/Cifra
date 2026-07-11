import { redirect } from 'next/navigation';
import { FavoritesClient } from '@/components/account/FavoritesClient';
import { auth } from '@/lib/auth/auth';

export default async function FavoritosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/entrar?como=user&callbackUrl=/conta/favoritos');
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-chakra text-3xl font-bold">Favoritos e coleções</h1>
      <p className="mt-2 text-sm text-neutral-600">Seu repertório (SPEC_006 B1).</p>
      <FavoritesClient />
    </div>
  );
}
