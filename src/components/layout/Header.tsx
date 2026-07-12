'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const loggedInAsUser = status === 'authenticated' && Boolean(session?.user);
  // Admin é sessão SEPARADA (cookie próprio, rota /admin/login): o header
  // precisa refletir "logado" também para o admin (UX: nunca mostrar Entrar
  // para quem já entrou).
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let alive = true;
    void fetch('/api/admin/me')
      .then((r) => {
        if (alive) setIsAdmin(r.ok);
      })
      .catch(() => {
        if (alive) setIsAdmin(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  const adminSignOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/';
  };
  const nav = 'transition-colors duration-fast hover:text-primary-300';

  const links: [string, string][] = [
    ['/', 'Músicas'],
    ['/acordes', 'Acordes'],
    ['/metronomo', 'Metrônomo'],
    ['/afinador', 'Afinador'],
    ['/historico', 'Histórico'],
    ['/faq', 'FAQ'],
    ['/adicionar', 'Adicionar'],
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stroke-100/80 bg-secondary-950/80 py-4 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group transition-colors">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-neutral-700 @Desktop:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={nav}>
              {label}
            </Link>
          ))}
          {loggedInAsUser ? (
            <>
              <Link href="/conta/favoritos" className={nav}>
                Favoritos
              </Link>
              <Link href="/conta/envios" className={nav}>
                Meus envios
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-lg border border-stroke-200 px-3 py-1.5 text-xs hover:border-primary-400"
              >
                Sair
              </button>
            </>
          ) : isAdmin ? (
            <>
              <Link href="/admin" className={nav}>
                Painel admin
              </Link>
              <button
                type="button"
                onClick={() => void adminSignOut()}
                className="rounded-lg border border-stroke-200 px-3 py-1.5 text-xs hover:border-primary-400"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/entrar"
              className="rounded-lg bg-primary-400 px-3 py-1.5 font-chakra text-xs font-semibold text-secondary-950 hover:bg-primary-300"
            >
              Entrar
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          className={cn(
            'cursor-pointer rounded-md p-2 text-neutral-700 hover:text-primary-300 @Desktop:hidden',
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
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

      {menuOpen && (
        <nav className="border-t border-stroke-100 bg-secondary-950/95 px-4 py-3 @Desktop:hidden">
          <div className="flex flex-col gap-3 text-sm text-neutral-700">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={nav}>
                {label}
              </Link>
            ))}
            {loggedInAsUser ? (
              <>
                <Link href="/conta/favoritos" onClick={() => setMenuOpen(false)}>
                  Favoritos
                </Link>
                <Link href="/conta/envios" onClick={() => setMenuOpen(false)}>
                  Meus envios
                </Link>
                <button type="button" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sair
                </button>
              </>
            ) : isAdmin ? (
              <>
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  Painel admin
                </Link>
                <button type="button" onClick={() => void adminSignOut()}>
                  Sair
                </button>
              </>
            ) : (
              <Link href="/entrar" onClick={() => setMenuOpen(false)} className="text-primary-400">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
