import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getUnifiedCatalog, listPendingVersions } from '@/lib/songs/server-catalog';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const songs = await getUnifiedCatalog({ admin: true });
  const pendingVersions = await listPendingVersions();

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-10 @Desktop:px-4">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">
          Painel do admin
        </p>
        <h1 className="font-chakra text-3xl font-bold text-neutral-900">Moderação e catálogo</h1>
        <p className="mt-2 text-sm text-neutral-700">
          Cifras enviadas por usuários autenticados entram na fila Postgres. Só publicam após
          aprovação. Rejeição grava motivo visível em &quot;Meus envios&quot;.
        </p>
      </div>
      <AdminDashboard songs={songs} pendingVersions={pendingVersions} />
    </div>
  );
}
