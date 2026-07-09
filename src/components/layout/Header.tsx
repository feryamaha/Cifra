'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-stroke-100 bg-secondary-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-chakra text-xl font-bold tracking-tight text-neutral-900">
          Cifra<span className="text-primary-400">Lab</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-5 text-sm text-neutral-700 @tablet:flex">
          <Link href="/" className="transition-colors hover:text-primary-300">
            Músicas
          </Link>
          <span className="cursor-not-allowed text-neutral-500" title="Em breve">
            Afinador
          </span>
          <span className="cursor-not-allowed text-neutral-500" title="Em breve">
            Entrar
          </span>
        </nav>

        {/* Botao hamburger mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          className={cn(
            'cursor-pointer rounded-md p-2 text-neutral-700 transition-colors hover:text-primary-300 @tablet:hidden',
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Nav mobile colapsavel */}
      {menuOpen && (
        <nav className="border-t border-stroke-100 bg-secondary-950 px-4 py-3 @tablet:hidden">
          <div className="flex flex-col gap-3 text-sm text-neutral-700">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="transition-colors hover:text-primary-300"
            >
              Músicas
            </Link>
            <span className="cursor-not-allowed text-neutral-500" title="Em breve">
              Afinador
            </span>
            <span className="cursor-not-allowed text-neutral-500" title="Em breve">
              Entrar
            </span>
          </div>
        </nav>
      )}
    </header>
  );
}
