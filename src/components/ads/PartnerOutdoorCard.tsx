'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { PartnerOutdoorCardProps } from '@/types/ads/partner-outdoor.types';

/**
 * Card outdoor de parceiros: carousel automático data-driven.
 * PORTA ÚNICA de publicidade do site (regra de produto NÃO NEGOCIÁVEL,
 * SPEC_010 D-4): todo ad do Cifra Tom é este card slider (home, footer,
 * flancos de página, aside da cifra, modal flash). NUNCA sobrepondo
 * conteúdo, NUNCA dentro de menus e, na página de cifra, NUNCA em cima,
 * no meio, embaixo ou sobre a cifra. Pausado em hover/focus e com
 * prefers-reduced-motion.
 */
export function PartnerOutdoorCard({ config, className }: PartnerOutdoorCardProps) {
  const { slides, copyright, intervalMs } = config;
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const count = slides.length;
  const active = count > 0 ? slides[index % count] : null;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [count, paused, reduceMotion, intervalMs]);

  if (!active) {
    return null;
  }

  return (
    <aside
      className={cn(
        'flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-stroke-100',
        'bg-secondary-900/70 shadow-stage backdrop-blur-[2px]',
        className,
      )}
      aria-labelledby={labelId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="flex items-center justify-between border-b border-stroke-100 px-3 py-2">
        <p
          id={labelId}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
        >
          Publicidade
        </p>
        {count > 1 && (
          <p className="font-mono text-[10px] tabular-nums text-neutral-500" aria-live="polite">
            {index + 1}/{count}
          </p>
        )}
      </div>

      <section className="relative" aria-label="Anúncios de parceiros">
        <a
          href={active.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-950"
          aria-label={`${active.text} (abre em nova aba)`}
        >
          <div className="relative aspect-[4/3] w-full bg-secondary-950">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={cn(
                  'absolute inset-0 transition-opacity duration-slow ease-out',
                  i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                aria-hidden={i !== index}
              >
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-contain p-4 transition-transform duration-normal group-hover:scale-[1.02]"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div className="border-t border-stroke-100 px-3 py-3">
            <p className="text-sm leading-snug text-neutral-900 text-balance">{active.text}</p>
          </div>
        </a>

        {count > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 border-t border-stroke-100 px-3 py-2.5"
            role="tablist"
            aria-label="Escolher anúncio"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Anúncio ${i + 1}: ${slide.text}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-fast',
                  i === index ? 'w-5 bg-primary-400' : 'w-1.5 bg-stroke-200 hover:bg-neutral-500',
                )}
              />
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-stroke-100 bg-secondary-950/60 px-3 py-2">
        <p className="text-center font-mono text-[10px] tracking-wide text-neutral-500">
          {copyright}
        </p>
      </div>
    </aside>
  );
}
