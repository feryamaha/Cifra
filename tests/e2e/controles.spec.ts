import { expect, test } from './fixtures';

/**
 * F6: transposição, capo e notação; F8: auto-rolagem; F15: download TXT.
 * Cifra de referência (SPEC_010): Gratidão, tom E.
 */

const SLUG = 'bruna-olly-gratidao-005e9c';

test.describe('Controles da cifra', () => {
  test('F6: transpor +2 pela stepper muda E para F#', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    await page.getByRole('button', { name: 'Controles' }).click();
    await expect(page.getByRole('heading', { name: 'Controles' })).toBeVisible();

    const aumentar = page.getByRole('button', { name: /Aumentar transposição/ });
    await aumentar.click();
    await aumentar.click();

    await expect(page.getByRole('button', { name: /^Acorde F#\./ }).first()).toBeVisible();
  });

  test('F6: capo na casa 2 mostra aviso de som × shape', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    await page.getByRole('button', { name: 'Controles' }).click();

    const secaoCapo = page.locator('section', { hasText: 'Capotraste' });
    await secaoCapo.getByRole('button', { name: '2', exact: true }).click();
    await expect(secaoCapo.getByText(/Soa em E\. Shapes de/)).toBeVisible();
  });

  test('F6: notação por números converte os acordes', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    await page.getByRole('button', { name: 'Controles' }).click();
    await page.getByRole('tab', { name: 'Números' }).click();

    await expect(page.getByRole('button', { name: /^Acorde E\./ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Acorde 1/ }).first()).toBeVisible();
  });

  test('F8: auto-rolagem rola a página sozinha e desliga', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    // Controle segmentado inline (UI atual): Off/Low/Mid/High
    await page.getByRole('button', { name: 'Auto-rolagem Low' }).click();

    await page.waitForFunction(() => window.scrollY > 50, undefined, { timeout: 20_000 });

    await page.getByRole('button', { name: 'Desligar auto-rolagem' }).click();
    const yAposDesligar = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(1500);
    const yFinal = await page.evaluate(() => window.scrollY);
    expect(Math.abs(yFinal - yAposDesligar)).toBeLessThan(5);
  });

  test('F15: baixar TXT dispara download com conteúdo', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    await page.getByRole('button', { name: 'Baixar' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar TXT' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`${SLUG}.txt`);
  });
});
