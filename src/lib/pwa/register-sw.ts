/**
 * Registra Service Worker (client-only) — apenas em produção.
 *
 * Em desenvolvimento o SW é ativamente DESREGISTRADO e os caches purgados:
 * chunks do Turbopack e payloads RSC (?_rsc=) mudam a cada rebuild, e um
 * cache-first persistido no browser serve flight/chunks stale, travando a
 * soft-navigation em "Rendering…" (ISSUE_003).
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  if (process.env.NODE_ENV !== 'production') {
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister();
    });
    if ('caches' in window) {
      void caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.startsWith('cifratom-')) void caches.delete(key);
        }
      });
    }
    return;
  }

  const register = () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* ignore */
    });
  };
  // 'load' pode já ter disparado quando o effect roda; registrar direto.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
