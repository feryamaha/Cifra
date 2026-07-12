import { AdsFlank } from '@/components/ads/AdsFlank';
import { Metronome } from '@/components/tools/Metronome';

export const metadata = { title: 'Metrônomo · Cifra Tom' };

export default function MetronomePage() {
  return (
    <AdsFlank>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-center font-chakra text-3xl font-bold">Metrônomo</h1>
        <p className="mb-8 text-center text-sm text-neutral-600">
          Clique para liberar o áudio se o navegador pedir.
        </p>
        <Metronome />
      </div>
    </AdsFlank>
  );
}
