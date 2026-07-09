import { AdSlot } from '@/components/ads/AdSlot';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-stroke-100 bg-secondary-950">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <AdSlot position="footer" />
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-neutral-500 @tablet:flex-row">
          <p>CifraLab · cifras 100% focadas em violão, sem anúncio no meio da música.</p>
          <p>Protótipo v0.2.0</p>
        </div>
      </div>
    </footer>
  );
}
