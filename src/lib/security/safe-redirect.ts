/**
 * Evita open redirect: só paths relativos internos.
 * Rejeita //evil.com, https://..., javascript:, etc.
 */

export function safeCallbackUrl(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  if (value.includes('\\')) return fallback;
  // rejeita caracteres de controle sem regex de control chars (lint)
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return fallback;
  }
  // bloqueia schemes embutidos
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return fallback;
  return value.slice(0, 512) || fallback;
}
