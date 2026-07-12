import { AdminBulkImport } from '@/components/admin/AdminBulkImport';

export const metadata = { title: 'Importar em lote · Admin · Cifra Tom' };
export const dynamic = 'force-dynamic';

/** SPEC_010 B2: atrás do proxy admin (matcher /admin/*). */
export default function AdminImportPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 py-10 @Desktop:px-4">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">
        Admin · importar em lote
      </p>
      <h1 className="font-chakra text-3xl font-bold text-neutral-900">Importar cifras</h1>
      <p className="mt-1 mb-8 text-sm text-neutral-700">
        Suba até 20 arquivos de uma vez; revise título e artista e publique direto no catálogo.
      </p>
      <AdminBulkImport />
    </div>
  );
}
