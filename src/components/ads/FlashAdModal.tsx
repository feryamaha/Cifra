'use client';

/**
 * Modal flash de publicidade (SPEC_010 C4-R2, estratégia do Fernando):
 * dispara a CADA navegação para rota elegível, contendo o MESMO card
 * slider de anúncios do site (PartnerOutdoorCard) + barra "Anuncie aqui".
 *  - home / ferramentas / listas: 10s · /musica/*: 10s com mensagem de
 *    pré-roll · portal (/conta/*, /adicionar): 20s
 *  - nunca em /admin e telas de auth
 *  - REGRA DE FECHAMENTO (vale para todo modal de ads): o botão fechar só
 *    aparece quando restam 5s na contagem; antes disso não há como fechar.
 *  - clique no e-mail da barra abre o modal de contato comercial
 *    (nome, e-mail, telefone, mensagem; enviar só com tudo preenchido).
 * Escape para testes E2E: sessionStorage 'cifratom.flash-ad.off' = '1'.
 */

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useId, useState } from 'react';
import { PartnerOutdoorCard } from '@/components/ads/PartnerOutdoorCard';
import flashData from '@/data/ads/flash-modal.json';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import { ADS_CONTACT_EMAIL, getHouseAdConfig } from '@/lib/ads/partner-outdoor';

const OFF_KEY = 'cifratom.flash-ad.off';
const BLOCKED_PREFIXES = ['/admin', '/entrar', '/cadastrar', '/esqueci-senha'];
const CLOSE_VISIBLE_AT = 5; // segundos restantes em que o fechar aparece

function durationFor(pathname: string): number | null {
  if (BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  if (pathname.startsWith('/musica')) return flashData.durations.musica;
  if (pathname.startsWith('/conta') || pathname.startsWith('/adicionar')) {
    return flashData.durations.portal;
  }
  return flashData.durations.default;
}

export function FlashAdModal() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const plan = session?.user?.plan === 'premium' ? 'premium' : 'free';
  const adsOn = areAdsEnabled({ plan });
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const isMusica = pathname.startsWith('/musica');
  const canClose = left <= CLOSE_VISIBLE_AT;

  useEffect(() => {
    if (!adsOn || !flashData.enabled) {
      setOpen(false);
      return;
    }
    const duration = durationFor(pathname);
    if (duration === null) {
      setOpen(false);
      return;
    }
    try {
      if (sessionStorage.getItem(OFF_KEY) === '1') return;
    } catch {
      /* segue sem o escape */
    }
    setLeft(duration);
    setOpen(true);
  }, [pathname, adsOn]);

  useEffect(() => {
    if (!open) return;
    const tick = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setOpen(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    const onKey = (e: KeyboardEvent) => {
      // Esc respeita a mesma regra do botão fechar (só nos 5s finais)
      if (e.key === 'Escape') {
        setLeft((v) => {
          if (v <= CLOSE_VISIBLE_AT) setOpen(false);
          return v;
        });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!adsOn) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Publicidade"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 print:hidden"
        >
          <div className="w-full max-w-lg rounded-2xl border border-stroke-200 bg-secondary-900 p-5 shadow-popover">
            <div className="mb-3 flex min-h-8 items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {flashData.eyebrow}
              </span>
              {canClose && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar publicidade"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-stroke-100 hover:text-neutral-900"
                >
                  ✕
                </button>
              )}
            </div>

            {isMusica && (
              <p className="mb-3 rounded-lg bg-primary-950 px-3 py-2 text-xs text-primary-300">
                {flashData.musicaMessage}
              </p>
            )}

            <div className="flex justify-center">
              <PartnerOutdoorCard config={getHouseAdConfig()} className="max-w-full" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stroke-200 bg-secondary-950/60 px-3 py-2.5">
              <p className="text-xs text-neutral-700">Anuncie aqui a sua empresa, seu negócio</p>
              <button
                type="button"
                onClick={() => {
                  setContactOpen(true);
                  setOpen(false);
                }}
                className="font-mono text-xs text-primary-400 underline hover:text-primary-300"
              >
                {ADS_CONTACT_EMAIL}
              </button>
            </div>

            <p
              className="mt-3 text-center font-mono text-xs tabular-nums text-neutral-500"
              aria-live="polite"
            >
              Fechamento automático em {left}s
            </p>
          </div>
        </div>
      )}
      {contactOpen && <AdContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}

/** Modal de contato comercial: nome, e-mail, telefone e mensagem. */
function AdContactModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const formId = useId();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const telefoneOk = telefone.replace(/\D/g, '').length >= 10;
  const ready = nome.trim().length >= 2 && emailOk && telefoneOk && mensagem.trim().length >= 5;

  const openMailto = () => {
    const assunto = encodeURIComponent('Quero anunciar no Cifra Tom');
    const corpo = encodeURIComponent(
      `Nome: ${nome.trim()}\nE-mail: ${email.trim()}\nTelefone: ${telefone.trim()}\n\nMensagem:\n${mensagem.trim()}`,
    );
    window.location.href = `mailto:${ADS_CONTACT_EMAIL}?subject=${assunto}&body=${corpo}`;
  };

  const enviar = async () => {
    if (!ready || sending) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/ads/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          mensagem: mensagem.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        sent?: boolean;
        fallback?: string;
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? 'Não foi possível enviar. Tente de novo.');
        setSending(false);
        return;
      }
      if (data.sent) {
        setStatus('Mensagem enviada. Entraremos em contato.');
        setSending(false);
        setTimeout(onClose, 1500);
        return;
      }
      // fallback mailto (sem RESEND_API_KEY ou provider falhou)
      openMailto();
      onClose();
    } catch {
      openMailto();
      onClose();
    } finally {
      setSending(false);
    }
  };

  const field =
    'w-full rounded-lg border border-stroke-200 bg-secondary-950 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contato comercial"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 print:hidden"
    >
      <div className="w-full max-w-md rounded-2xl border border-stroke-200 bg-secondary-900 p-6 shadow-popover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-chakra text-lg font-semibold text-neutral-900">
            Anuncie no Cifra Tom
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar contato"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-stroke-100 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <label className="block" htmlFor={`${formId}-nome`}>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Nome
            </span>
            <input
              id={`${formId}-nome`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className={field}
            />
          </label>
          <label className="block" htmlFor={`${formId}-email`}>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              E-mail
            </span>
            <input
              id={`${formId}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              className={field}
            />
          </label>
          <label className="block" htmlFor={`${formId}-tel`}>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Telefone
            </span>
            <input
              id={`${formId}-tel`}
              type="tel"
              inputMode="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value.replace(/[^\d\s()+-]/g, ''))}
              placeholder="(11) 99999-9999"
              className={field}
            />
          </label>
          <label className="block" htmlFor={`${formId}-msg`}>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Mensagem
            </span>
            <textarea
              id={`${formId}-msg`}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
              placeholder="Conte o que você quer anunciar"
              className={field}
            />
          </label>
        </div>

        {status && (
          <p className="mt-3 text-center text-xs text-primary-300" role="status">
            {status}
          </p>
        )}
        <p className="mt-2 text-center text-[10px] text-neutral-500">
          Com e-mail do servidor configurado, enviamos direto. Senão, abre o app de e-mail (mailto).
        </p>
        <button
          type="button"
          disabled={!ready || sending}
          onClick={() => void enviar()}
          className="mt-3 w-full rounded-xl border border-primary-600 bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950 transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
