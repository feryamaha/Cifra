import Link from 'next/link';
import { PartnerOutdoorCard } from '@/components/ads/PartnerOutdoorCard';
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '@/data/site/footer-nav.data';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import { getFooterCarousel } from '@/lib/ads/partner-outdoor';

export function Footer() {
  const adsOn = areAdsEnabled();
  const footerCarousel = adsOn
    ? getFooterCarousel()
    : { columns: [] as ReturnType<typeof getFooterCarousel>['columns'] };

  return (
    <footer className="mt-12 border-t border-stroke-100 bg-secondary-950 print:hidden">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
        {adsOn && (
          <>
            {/* 3 colunas de carrossel de parceiros */}
            {footerCarousel.columns.length > 0 && (
              <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-3 @tablet:gap-5">
                {footerCarousel.columns.map((column) => (
                  <PartnerOutdoorCard
                    key={column.id}
                    config={column.config}
                    className="mx-auto w-full max-w-sm @tablet:max-w-none"
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-6 @tablet:grid-cols-4 @Desktop:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-2 font-chakra text-xs font-semibold uppercase tracking-wider text-primary-400">
                {col.title}
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-600">
                {col.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link href={link.href} className="transition-colors hover:text-primary-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="mb-2 font-chakra text-xs font-semibold uppercase tracking-wider text-primary-400">
              Social
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-600">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-primary-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-stroke-100 pt-6 text-xs text-neutral-500 @tablet:flex-row">
          <p>
            © {new Date().getFullYear()} Cifra Tom. Todos os direitos reservados. Cifras 100%
            focadas em violão, sem anúncio no meio da música.
          </p>
          <p className="flex items-center gap-3">
            <Link href="/termos" className="transition-colors hover:text-primary-300">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="transition-colors hover:text-primary-300">
              Privacidade
            </Link>
            <span>v0.2.0</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
