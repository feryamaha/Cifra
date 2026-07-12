import Link from 'next/link';
import { PartnerOutdoorCard } from '@/components/ads/PartnerOutdoorCard';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { FAQ_ITEMS } from '@/data/faq/faq.data';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import { getHouseAdConfig } from '@/lib/ads/partner-outdoor';

export const metadata = {
  title: 'FAQ · Cifra Tom',
  description: 'Perguntas frequentes sobre o Cifra Tom.',
};

export default function FaqPage() {
  const adsOn = areAdsEnabled();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-primary-400">
          Central de ajuda
        </p>
        <h1 className="font-chakra text-4xl font-bold text-neutral-900">Perguntas frequentes</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">
          Tudo sobre cifras, transposição, ferramentas, conta e anúncios. Não achou? Fale com a
          gente pela sua{' '}
          <Link href="/conta/envios" className="text-primary-400 underline">
            conta
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-8 @Desktop:grid-cols-[minmax(0,1fr)_300px] @Desktop:items-start">
        <FaqAccordion items={FAQ_ITEMS} />

        <aside className="space-y-4 @Desktop:sticky @Desktop:top-24">
          {adsOn && (
            <div className="flex justify-center">
              <PartnerOutdoorCard config={getHouseAdConfig()} />
            </div>
          )}
          <div className="rounded-xl border border-stroke-200 bg-secondary-900/60 p-4">
            <p className="font-chakra text-sm font-semibold text-neutral-900">Ainda com dúvida?</p>
            <p className="mt-1 text-xs text-neutral-600">
              Envie sua cifra ou uma mensagem pela conta. Respondemos por lá.
            </p>
            <Link
              href="/adicionar"
              className="mt-3 inline-flex rounded-lg border border-primary-600 bg-primary-400 px-3 py-1.5 text-xs font-semibold text-secondary-950 hover:bg-primary-300"
            >
              Enviar cifra
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
