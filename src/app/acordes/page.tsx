import { AdsFlank } from '@/components/ads/AdsFlank';
import { ChordDictionary } from '@/components/tools/ChordDictionary';

export const metadata = { title: 'Dicionário de acordes · Cifra Tom' };

export default function ChordsPage() {
  return (
    <AdsFlank>
      <div className="mx-auto w-full px-4 py-12">
        <h1 className="mb-2 text-center font-chakra text-3xl font-bold">Dicionário de acordes</h1>
        <p className="mb-8 text-center text-sm text-neutral-600">
          Notação brasileira · afinação padrão
        </p>
        <ChordDictionary />
      </div>
    </AdsFlank>
  );
}
