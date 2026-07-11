import { TERMS_SECTIONS, TERMS_TITLE } from '@/data/legal/terms.data';

export const metadata = { title: `${TERMS_TITLE} · Cifra Tom` };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-chakra text-3xl font-bold text-neutral-900">{TERMS_TITLE}</h1>
      <p className="mt-2 text-xs text-neutral-500">Última revisão: 2026-07-11</p>
      <div className="mt-8 space-y-6">
        {TERMS_SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="font-chakra text-lg font-semibold text-primary-400">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
