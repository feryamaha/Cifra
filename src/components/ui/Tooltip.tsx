'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TooltipProps } from '@/types/ui/tooltip.types';

const POSITION_CLASSES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const;

export function Tooltip({
  content,
  position = 'top',
  children,
  delay = 200,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md border border-stroke-200 bg-secondary-800 px-2.5 py-1.5 text-xs text-neutral-900 shadow-10',
            POSITION_CLASSES[position],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
