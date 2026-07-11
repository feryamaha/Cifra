import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { FAQ_ITEMS } from '@/data/faq/faq.data';

export const metadata = {
  title: 'FAQ · Cifra Tom',
  description: 'Perguntas frequentes sobre o Cifra Tom.',
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-chakra text-3xl font-bold text-neutral-900">Perguntas frequentes</h1>
      <p className="mt-2 text-sm text-neutral-600">Respostas sobre cifras, conta e uso do site.</p>
      <div className="mt-8">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
