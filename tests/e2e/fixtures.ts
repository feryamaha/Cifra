import { test as base, expect } from '@playwright/test';

/**
 * Fixture padrão da suíte: desliga o modal flash de publicidade via o escape
 * documentado em FlashAdModal (sessionStorage 'cifratom.flash-ad.off'), para
 * os fluxos não serem interceptados pelo overlay. O modal tem teste próprio
 * em conteudo.spec.ts, que limpa esse flag.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('cifratom.flash-ad.off', '1');
      } catch {
        /* contexto sem storage */
      }
    });
    await use(page);
  },
});

export { expect };
