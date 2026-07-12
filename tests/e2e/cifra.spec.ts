import { expect, test } from './fixtures';

/**
 * F3: URL direta; F4: cifra do Neon; F5: hover de shape; F16: deep-link.
 * Cifra de referência (SPEC_010): Gratidão, Bruna Olly, tom E (real, no Neon).
 */

const SLUG = 'bruna-olly-gratidao-005e9c';

test.describe('Página de cifra', () => {
  test('F3: URL direta renderiza o chrome completo', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Gratid/);
    await expect(page.getByText('Tom: E', { exact: true }).first()).toBeVisible();

    for (const nome of ['Controles', 'Imprimir', 'Baixar', 'Compartilhar']) {
      await expect(page.getByRole('button', { name: nome })).toBeVisible();
    }
    // Auto-rolagem: controle segmentado inline (Off/Low/Mid/High)
    await expect(page.getByRole('button', { name: 'Desligar auto-rolagem' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auto-rolagem Low' })).toBeVisible();

    await expect(page.getByText('INTRO', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('PROGRESSÕES DE ACORDES')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('F4: cifra publicada no Neon abre por URL direta', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    const naoEncontrada = await page
      .getByText('Música não encontrada')
      .isVisible()
      .catch(() => false);
    test.skip(naoEncontrada, 'DB indisponível ou cifra não publicada neste ambiente');

    // Regex por causa da normalização Unicode NFD dos títulos vindos do DB
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Gratid/);
    await expect(page.getByText('INTRO', { exact: false }).first()).toBeVisible();
  });

  test('F5: hover no acorde mostra o shape e sair esconde', async ({ page }) => {
    await page.goto(`/musica/${SLUG}`);
    const acorde = page.getByRole('button', { name: /^Acorde E\./ }).first();
    await expect(acorde).toBeVisible();

    await acorde.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('svg').first()).toBeVisible();

    await page.getByRole('heading', { level: 1 }).hover();
    await expect(tooltip).toBeHidden();
  });

  test('F16: deep-link ?tom=2 abre a cifra já transposta (E → F#)', async ({ page }) => {
    await page.goto(`/musica/${SLUG}?tom=2`);
    await expect(page.getByRole('button', { name: /^Acorde F#\./ }).first()).toBeVisible();
    await expect(page.getByText('Tom: F#', { exact: true }).first()).toBeVisible();
  });
});
