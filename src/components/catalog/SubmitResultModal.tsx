'use client';

import Link from 'next/link';

export function SubmitResultModal({
  open,
  ok,
  message,
  onClose,
}: {
  open: boolean;
  ok: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-drawer flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal
        className="w-full max-w-md rounded-xl border border-stroke-100 bg-secondary-950 p-6 shadow-stage"
      >
        <h2 className="font-chakra text-xl font-bold text-neutral-900">
          {ok ? 'Envio recebido' : 'Não foi possível enviar'}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">{message}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {ok ? (
            <>
              <Link
                href="/conta/envios"
                className="rounded-lg border border-stroke-200 px-3 py-2 text-sm text-neutral-900 hover:border-primary-400"
              >
                Ver meus envios
              </Link>
              <Link
                href="/"
                className="rounded-lg bg-primary-400 px-3 py-2 text-sm font-semibold text-secondary-950"
              >
                Concluir e ir à home
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-primary-400 px-3 py-2 text-sm font-semibold text-secondary-950"
            >
              Revisar e tentar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
