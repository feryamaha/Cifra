import { PartnerOutdoorCard } from '@/components/ads/PartnerOutdoorCard';
import { SongSearch } from '@/components/catalog/SongSearch';
import { TrendingList } from '@/components/catalog/TrendingList';
import { Badge } from '@/components/ui/Badge';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import { getPartnerOutdoor } from '@/lib/ads/partner-outdoor';
import { getUnifiedCatalog } from '@/lib/songs/server-catalog';

// Catálogo no Neon com ISR (SPEC_012 A2): cache de 120s + revalidação
// sob demanda a cada mutação do admin (revalidateSongContent).
export const revalidate = 120;

export default async function HomePage() {
  const songs = await getUnifiedCatalog({ admin: false });
  const outdoor = areAdsEnabled() ? getPartnerOutdoor() : null;

  return (
    <div className="mx-auto max-w-[1440px] px-3 py-10 @Desktop:px-4">
      <section className="relative mb-10 overflow-hidden rounded-2xl border border-stroke-100 bg-secondary-900/40 px-5 py-10 shadow-stage @tablet:px-10 @tablet:py-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_30%_40%,rgba(242,171,60,0.12),transparent_70%)]"
          aria-hidden
        />
        <div className="relative grid items-center gap-8 @tablet:grid-cols-[minmax(0,1fr)_minmax(240px,20rem)] @Desktop:grid-cols-[minmax(0,1fr)_minmax(260px,21rem)] @Desktop:gap-12">
          <div className="min-w-0 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-400">
              Cifras para violão
            </p>
            <h1 className="font-chakra text-4xl font-bold tracking-tight text-neutral-900 text-balance @tablet:text-5xl">
              O violão no centro:{' '}
              <span className="text-primary-400">cifra limpa, sem anúncio no meio da música</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-neutral-700">
              Um lugar limpo pra tocar. Passe o mouse sobre qualquer acorde e veja o shape na hora.
              Transponha o tom, calcule o capotraste e leia a progressão em números da escala, um
              método que só o Cifra Tom tem.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#acervo"
                className="inline-flex items-center justify-center rounded-xl border border-primary-600 bg-primary-400 px-5 py-3 text-sm font-semibold text-secondary-950 transition-colors hover:bg-primary-300"
              >
                Explorar o acervo
              </a>
              <a
                href="/adicionar"
                className="inline-flex items-center justify-center rounded-xl border border-stroke-200 bg-secondary-800 px-5 py-3 text-sm font-semibold text-primary-300 transition-colors hover:border-primary-500"
              >
                Enviar minha cifra
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                'Foco total em violão',
                'Transposição e capotraste',
                'Método numérico exclusivo',
                'Sem anúncio na cifra',
              ].map((item) => (
                <li key={item}>
                  <Badge variant="amber">{item}</Badge>
                </li>
              ))}
            </ul>
          </div>

          {outdoor && (
            <div className="flex justify-center @tablet:justify-end">
              <PartnerOutdoorCard config={outdoor} />
            </div>
          )}
        </div>
      </section>

      <TrendingList />
      <div id="acervo" className="scroll-mt-24">
        <SongSearch songs={songs} />
      </div>
    </div>
  );
}
