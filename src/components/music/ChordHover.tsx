'use client';

/**
 * Tooltip/modal do shape AO LADO do acorde.
 * Aceita várias variações de shape no mesmo hover.
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

type Pos = { top: number; left: number };

const GAP = 10;
const DIAGRAM_W = 140;

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
  const [pos, setPos] = useState<Pos | null>(null);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  const allShapes = variations.length > 0 ? variations : voicing ? [voicing] : [];

  const tipW = Math.min(allShapes.length, 3) * DIAGRAM_W + 24;
  const tipH = allShapes.length > 1 ? 210 : 178;

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = tipW;
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
      left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
      top = r.top - h - GAP;
      if (top < 8) top = r.bottom + GAP;
    }

    top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
    setPos({ top, left });
  }, [tipW, tipH]);

  const openTip = useCallback(() => {
    place();
    setOpen(true);
  }, [place]);

  const closeTip = useCallback(() => setOpen(false), []);

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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      closeTip();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, closeTip]);

  const tooltip =
    mounted &&
    open &&
    pos &&
    createPortal(
      <div
        id={tipId}
        role="tooltip"
        className={cn(
          'fixed z-[9999] rounded-xl border border-stroke-200',
          'bg-secondary-800 p-2.5 shadow-popover',
          'animate-popover-in',
        )}
        style={{ top: pos.top, left: pos.left, width: tipW }}
      >
        {allShapes.length > 0 ? (
          <div className="space-y-1.5">
            {allShapes.length > 1 && (
              <p className="px-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Variações · {display} · {allShapes.length} shapes · deslize para ver
              </p>
            )}
            <div className="flex gap-2 overflow-x-auto">
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
      onMouseEnter={openTip}
      onMouseLeave={closeTip}
      onFocus={openTip}
      onBlur={closeTip}
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
        aria-label={`Acorde ${display}. Passe o mouse para ver o shape.`}
        onClick={() => {
          onSelect?.(symbol);
          if (open) closeTip();
          else openTip();
        }}
      >
        {display}
      </button>
      {tooltip}
    </span>
  );
}
