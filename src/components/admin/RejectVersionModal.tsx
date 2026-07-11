'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export const REJECTION_OPTIONS = [
  { value: 'duplication', label: 'Duplicação de cifra' },
  { value: 'typos', label: 'Erros de digitação' },
  { value: 'technical_error', label: 'Erro técnico na cifra' },
  { value: 'copyright', label: 'Direitos autorais' },
  { value: 'edit_required', label: 'Solicitação de edição' },
] as const;

export type RejectionCategory = (typeof REJECTION_OPTIONS)[number]['value'];

export function RejectVersionModal({
  open,
  versionTitle,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  versionTitle: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (data: { category: RejectionCategory; reason: string }) => void;
}) {
  const [category, setCategory] = useState<RejectionCategory | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!category) {
      setError('Selecione o tipo de rejeição.');
      return;
    }
    const text = reason.trim();
    if (text.length < 5) {
      setError('Descreva o motivo com pelo menos 5 caracteres.');
      return;
    }
    onSubmit({ category, reason: text });
  };

  return (
    <div className="fixed inset-0 z-drawer flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="reject-title"
        className="w-full max-w-md rounded-xl border border-stroke-100 bg-secondary-950 p-6 shadow-stage"
      >
        <h2 id="reject-title" className="font-chakra text-xl font-bold text-neutral-900">
          Rejeitar publicação
        </h2>
        <p className="mt-1 text-sm text-neutral-700 line-clamp-2">{versionTitle}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Motivo (obrigatório)
            </legend>
            {REJECTION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  category === opt.value
                    ? 'border-primary-400 bg-primary-400/10 text-neutral-900'
                    : 'border-stroke-200 text-neutral-700 hover:border-stroke-100',
                )}
              >
                <input
                  type="radio"
                  name="reject-category"
                  value={opt.value}
                  checked={category === opt.value}
                  onChange={() => setCategory(opt.value)}
                  className="accent-primary-400"
                />
                {opt.label}
              </label>
            ))}
          </fieldset>

          <label className="block space-y-1 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Mensagem detalhada
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              placeholder="Explique o que o autor deve corrigir ou por que a cifra não será publicada…"
              className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400"
            />
          </label>

          {error && (
            <p className="text-sm text-auxiliary-danger-default" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 rounded-lg border border-stroke-200 py-2 text-sm text-neutral-700 hover:border-primary-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-auxiliary-danger-default py-2 text-sm font-semibold text-secondary-950 hover:brightness-110 disabled:opacity-50"
            >
              {busy ? 'Enviando…' : 'Enviar rejeição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
