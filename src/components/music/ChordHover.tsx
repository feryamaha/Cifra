'use client';

/**
 * Card de shapes AO LADO do acorde (SPEC_011 rodada 2).
 *
 * Dois modos:
 *  - HOVER (espiada): aparece ao passar o mouse e some ao sair, como manda a
 *    regra UX do AGENTS.md §5.1.
 *  - FIXADO (clique/toque): clicar no acorde FIXA o card aberto; ele persiste
 *    por qualquer interação (deslizar as variações, tocar dentro dele) e SÓ
 *    fecha no botão ✕. Clicar em outro acorde fixa o novo e fecha o anterior.
 *
 * Responsivo: a largura nunca passa de (viewport - 16px); as variações rolam
 * em scroll-x dentro do card.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChordDiagram } from '@/components/ui/ChordDiagram';
import { cn } from '@/lib/utils';
import type { Tuning } from '@/types/music/tunings.types';
import type { Voicing } from '@/types/music/voicing.types';

export interface ChordHoverProps {
  symbol: string;
  display: string;
  voicing: Voicing | null;
  /** shapes alternativos (variações); se vazio, só mostra voicing */
  variations?: Voicing[];
  tuning: Tuning;
  active?: boolean;
  onSelect?: (symbol: string) => void;
  /** visual do gatilho: texto da cifra ou badge da sequência */
  trigger?: 'chord' | 'badge';
}

type Pos = { top: number; left: number; width: number };

const GAP = 10;
const DIAGRAM_W = 140;
const EDGE = 8;

/** Só um card fixado por vez: fixar um novo fecha o anterior. */
let closeActivePinned: (() => void) | null = null;

export function ChordHover({
  symbol,
  display,
  voicing,
  variations = [],
  tuning,
  active = false,
  onSelect,
  trigger = 'chord',
}: ChordHoverProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const tipId = useId();

  const allShapes = variations.length > 0 ? variations : voicing ? [voicing] : [];

  const idealW = Math.min(allShapes.length, 3) * DIAGRAM_W + 24;
  const tipH = allShapes.length > 1 ? 236 : 204;

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Responsivo: nunca mais largo que a viewport (mobile cortava o card)
    const w = Math.min(idealW, window.innerWidth - EDGE * 2);
    const h = tipH;

    const spaceRight = window.innerWidth - r.right;
    const spaceLeft = r.left;

    let left: number;
    let top = r.top + r.height / 2 - h / 2;

    if (spaceRight >= w + GAP) {
      left = r.right + GAP;
    } else if (spaceLeft >= w + GAP) {
      left = r.left - w - GAP;
    } else {
      left = Math.max(EDGE, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - EDGE));
      top = r.top - h - GAP;
      if (top < EDGE) top = r.bottom + GAP;
    }

    top = Math.max(EDGE, Math.min(top, window.innerHeight - h - EDGE));
    setPos({ top, left, width: w });
  }, [idealW, tipH]);

  const closeTip = useCallback(() => {
    setOpen(false);
    setPinned(false);
    pinnedRef.current = false;
    if (closeActivePinned === close_self.current) closeActivePinned = null;
  }, []);

  /** ref estável para o singleton de card fixado */
  const close_self = useRef<() => void>(() => {});
  useEffect(() => {
    close_self.current = closeTip;
  }, [closeTip]);

  const openTransient = useCallback(() => {
    if (pinnedRef.current) return;
    place();
    setOpen(true);
  }, [place]);

  const closeTransient = useCallback(() => {
    if (pinnedRef.current) return;
    setOpen(false);
  }, []);

  const pin = useCallback(() => {
    if (closeActivePinned && closeActivePinned !== close_self.current) closeActivePinned();
    closeActivePinned = close_self.current;
    pinnedRef.current = true;
    setPinned(true);
    place();
    setOpen(true);
  }, [place]);

  // desmontagem: libera o singleton
  useEffect(() => {
    return () => {
      if (closeActivePinned === close_self.current) closeActivePinned = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const reflow = () => place();
    window.addEventListener('scroll', reflow, true);
    window.addEventListener('resize', reflow);
    return () => {
      window.removeEventListener('scroll', reflow, true);
      window.removeEventListener('resize', reflow);
    };
  }, [open, place]);

  // Fechar por toque fora vale SÓ para o modo espiada (hover). Card fixado
  // ignora qualquer clique fora: fecha apenas no ✕ (ordem do produto).
  useEffect(() => {
    if (!open || pinned) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (tipRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, pinned]);

  const tooltip =
    mounted &&
    open &&
    pos &&
    createPortal(
      <div
        id={tipId}
        ref={tipRef}
        role="dialog"
        aria-modal="false"
        aria-label={`Shapes de ${display}`}
        className={cn(
          'fixed z-[9999] rounded-xl border border-stroke-200',
          'bg-secondary-800 p-2.5 shadow-popover',
          'animate-popover-in',
        )}
        style={{ top: pos.top, left: pos.left, width: pos.width }}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate px-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            {allShapes.length > 1
              ? `${display} · ${allShapes.length} shapes · deslize para ver`
              : display}
          </p>
          <button
            type="button"
            onClick={closeTip}
            aria-label={`Fechar shapes de ${display}`}
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-stroke-100 hover:text-neutral-900"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {allShapes.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto overscroll-contain pb-1">
            {allShapes.map((v, i) => (
              <div key={i} className="shrink-0">
                <ChordDiagram
                  voicing={v}
                  tuning={tuning}
                  label={allShapes.length > 1 ? `${display} · ${i + 1}` : display}
                  size="sm"
                  showFingers
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-1 py-6 text-center font-mono text-xs text-neutral-500">
            Shape indisponível para {display}
          </p>
        )}
      </div>,
      document.body,
    );

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={openTransient}
      onMouseLeave={closeTransient}
      onFocus={openTransient}
      onBlur={closeTransient}
    >
      <button
        type="button"
        className={cn(
          'transition-colors duration-fast ease-out',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
          trigger === 'chord' &&
            cn(
              'relative inline-flex cursor-pointer rounded-md px-1 py-0.5',
              'font-mono text-[0.9em] font-bold leading-tight text-primary-300',
              'hover:bg-primary-950 hover:text-primary-200',
              active && 'bg-primary-400 text-secondary-950',
            ),
          trigger === 'badge' &&
            cn(
              'inline-flex cursor-pointer items-center justify-center gap-1 rounded-full border px-2.5 py-0.5',
              'border-primary-800 bg-primary-950 font-mono text-xs text-primary-300 shadow-10',
              'hover:border-primary-500 hover:bg-primary-900 hover:text-primary-200',
              active && 'border-primary-400 bg-primary-400 text-secondary-950',
            ),
        )}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={pinned}
        aria-label={`Acorde ${display}. Clique para fixar os shapes.`}
        onClick={() => {
          onSelect?.(symbol);
          pin();
        }}
      >
        {display}
      </button>
      {tooltip}
    </span>
  );
}
