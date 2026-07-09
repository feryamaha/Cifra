'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ModalProps } from '@/types/ui/modal.types';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const;

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-modal-overlay-fade-in bg-secondary-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative w-full animate-modal-slide-in rounded-xl border border-stroke-200 bg-secondary-900 shadow-60',
          'focus-visible:outline-2 focus-visible:outline-primary-400 focus-visible:outline-offset-2',
          SIZE_CLASSES[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-stroke-100 px-5 py-4">
            <h2 className="font-chakra text-lg font-semibold text-neutral-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="cursor-pointer rounded-md p-1 text-neutral-500 transition-colors hover:bg-secondary-800 hover:text-neutral-900"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 5l10 10M15 5l-10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-stroke-100 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
