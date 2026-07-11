'use client';

import { useState } from 'react';
import type { FaqItem } from '@/data/faq/faq.data';

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-xl border border-stroke-200 bg-secondary-900 px-4 py-3 transition-colors"
            style={{ borderColor: isOpen ? 'var(--color-primary-700, #b46218)' : undefined }}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-2 text-left font-chakra text-sm font-semibold text-neutral-900"
            >
              {item.question}
              <span
                className="text-primary-400 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-all duration-200"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="pt-2 text-sm leading-relaxed text-neutral-700">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
