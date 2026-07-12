'use client';

import { useState } from 'react';
import {
  FAQ_CATEGORY_LABELS,
  FAQ_CATEGORY_ORDER,
  type FaqCategory,
  type FaqItem,
} from '@/data/faq/faq.data';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-primary-400 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const byCategory = FAQ_CATEGORY_ORDER.map((cat) => ({
    cat,
    label: FAQ_CATEGORY_LABELS[cat],
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      {byCategory.map((group) => (
        <section key={group.cat} aria-label={group.label}>
          <h2 className="mb-3 flex items-center gap-2 font-chakra text-xs font-semibold uppercase tracking-wider text-primary-400">
            <span className="h-px flex-1 bg-stroke-100" aria-hidden />
            {group.label}
            <span className="h-px flex-1 bg-stroke-100" aria-hidden />
          </h2>
          <div className="space-y-2.5">
            {group.items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-xl border bg-secondary-900 transition-colors ${
                    isOpen ? 'border-primary-700' : 'border-stroke-200 hover:border-primary-800'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-chakra text-sm font-semibold text-neutral-900"
                  >
                    {item.question}
                    <Chevron open={isOpen} />
                  </button>
                  <div
                    className="grid transition-all duration-200 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-700">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export type { FaqCategory };
