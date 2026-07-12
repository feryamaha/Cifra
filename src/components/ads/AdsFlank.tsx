import { PartnerOutdoorCard } from '@/components/ads/PartnerOutdoorCard';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import { getHouseAdConfig } from '@/lib/ads/partner-outdoor';

/**
 * Layout com ads flanqueando o conteúdo (SPEC_010 C2): o MESMO card slider
 * da home/footer de CADA lado da ferramenta no desktop; no mobile os cards
 * descem para DEPOIS do conteúdo. Nunca sobrepõe: é grid, não overlay.
 */
export function AdsFlank({ children }: { children: React.ReactNode }) {
  if (!areAdsEnabled()) return <>{children}</>;
  const house = getHouseAdConfig();

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 @Desktop:grid-cols-[260px_minmax(0,1fr)_260px] @Desktop:items-start">
      <div className="order-2 flex justify-center @Desktop:order-1 @Desktop:sticky @Desktop:top-24">
        <PartnerOutdoorCard config={house} />
      </div>
      <div className="order-1 min-w-0 @Desktop:order-2">{children}</div>
      <div className="order-3 flex justify-center @Desktop:sticky @Desktop:top-24">
        <PartnerOutdoorCard config={house} />
      </div>
    </div>
  );
}
