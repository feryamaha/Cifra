import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export const metadata = { title: 'Premium · Cifra Tom' };

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-chakra text-3xl font-bold">Cifra Tom Premium</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Sem anúncios no footer e outdoor; histórico e listas com limites maiores. Pagamento online
        em spec futura.
      </p>
      <Card className="mt-8 space-y-3 p-6">
        <ul className="list-inside list-disc space-y-2 text-sm">
          <li>Sem anúncios no rodapé e na home</li>
          <li>Histórico local com limite maior</li>
          <li>Campo plan no perfil (free | premium)</li>
        </ul>
        <p className="text-xs text-neutral-500">
          Dev: <code className="rounded bg-secondary-800 px-1">CIFRATOM_FORCE_PREMIUM=1</code>
        </p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-primary-400 px-4 py-2 text-sm font-semibold text-secondary-950"
        >
          Voltar ao catálogo
        </Link>
      </Card>
    </div>
  );
}
