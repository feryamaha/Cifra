import { AdsFlank } from '@/components/ads/AdsFlank';
import { Tuner } from '@/components/tools/Tuner';

export const metadata = { title: 'Afinador · Cifra Tom' };

export default function TunerPage() {
  return (
    <AdsFlank>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-center font-chakra text-3xl font-bold">Afinador online</h1>
        <p className="mb-8 text-center text-sm text-neutral-600">
          Use o microfone. Permita o acesso quando o navegador solicitar.
        </p>
        <Tuner />
      </div>
    </AdsFlank>
  );
}
