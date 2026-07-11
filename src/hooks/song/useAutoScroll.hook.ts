'use client';

import { type RefObject, useEffect, useRef } from 'react';
import { AUTO_SCROLL_SPEED_MAP } from '@/data/song-view/auto-scroll.data';
import type { AutoScrollSpeed } from '@/types/song/auto-scroll.types';

export interface UseAutoScrollOptions {
  speed: AutoScrollSpeed;
  /**
   * Containers com overflow próprio (ex.: painel sticky de progressões).
   * A janela (cifra / página) sempre rola junto.
   */
  panelRefs?: RefObject<HTMLElement | null>[];
}

function canScrollElement(el: HTMLElement): boolean {
  return el.scrollHeight - el.clientHeight - el.scrollTop > 1;
}

function canScrollWindow(): boolean {
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight < doc.scrollHeight - 1;
}

/**
 * Auto-rolagem suave (rAF) para a página da cifra e painéis laterais.
 * Para no fim; pausa se o usuário rolar manualmente (wheel/touch/teclas).
 */
export function useAutoScroll({ speed, panelRefs = [] }: UseAutoScrollOptions): void {
  const panelRefsRef = useRef(panelRefs);
  panelRefsRef.current = panelRefs;

  const userPausedUntilRef = useRef(0);

  useEffect(() => {
    if (speed === 'off') return;

    const pxPerSecond = AUTO_SCROLL_SPEED_MAP[speed];
    if (pxPerSecond <= 0) return;

    let rafId = 0;
    let lastTs: number | null = null;
    let carry = 0;

    const onUserIntent = () => {
      // Pausa breve para não “brigar” com o scroll do músico
      userPausedUntilRef.current = performance.now() + 1800;
    };

    window.addEventListener('wheel', onUserIntent, { passive: true });
    window.addEventListener('touchmove', onUserIntent, { passive: true });
    window.addEventListener('keydown', onUserIntent);

    const tick = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      if (ts >= userPausedUntilRef.current) {
        carry += pxPerSecond * dt;
        const step = Math.floor(carry);
        if (step > 0) {
          carry -= step;

          if (canScrollWindow()) {
            window.scrollBy({ top: step, left: 0, behavior: 'auto' });
          }

          for (const ref of panelRefsRef.current) {
            const el = ref.current;
            if (el && canScrollElement(el)) {
              el.scrollTop += step;
            }
          }
        }
      }

      const windowDone = !canScrollWindow();
      const panelsDone = panelRefsRef.current.every((ref) => {
        const el = ref.current;
        return !el || !canScrollElement(el);
      });

      if (windowDone && panelsDone) {
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onUserIntent);
      window.removeEventListener('touchmove', onUserIntent);
      window.removeEventListener('keydown', onUserIntent);
    };
  }, [speed]);
}
