import { expect, test } from './fixtures';

/** F11: FAQ acordeão; F12: legais + footer; F13: superfícies de auth. */

test.describe('Conteúdo e auth', () => {
  test('F11: FAQ abre um item e fecha o anterior (acordeão exclusivo)', async ({ page }) => {
    await page.goto('/faq');
    // Escopo em main: o botão Menu do header também tem aria-expanded
    const perguntas = page.locator('main button[aria-expanded]');
    const primeira = perguntas.nth(0);
    const segunda = perguntas.nth(1);

    await primeira.click();
    await expect(primeira).toHaveAttribute('aria-expanded', 'true');

    await segunda.click();
    await expect(segunda).toHaveAttribute('aria-expanded', 'true');
    await expect(primeira).toHaveAttribute('aria-expanded', 'false');
  });

  test('F12: política de privacidade renderiza seções LGPD', async ({ page }) => {
    await page.goto('/privacidade');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade');
    await expect(page.getByText(/LGPD/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Seus direitos/ })).toBeVisible();
  });

  test('F12: termos de uso renderizam seções completas', async ({ page }) => {
    await page.goto('/termos');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Termos de Uso');
    await expect(page.getByRole('heading', { name: /Propriedade intelectual/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /foro/i })).toBeVisible();
  });

  test('F12: footer leva para termos e privacidade', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer a[href="/termos"]').first().click();
    await expect(page).toHaveURL(/\/termos$/);
    await page.goBack();
    await page.locator('footer a[href="/privacidade"]').first().click();
    await expect(page).toHaveURL(/\/privacidade$/);
  });

  test('F13: página de login renderiza formulário sem exigir conta', async ({ page }) => {
    await page.goto('/entrar?como=user');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(
      page.locator('input[type="password"], input[name="password"]').first(),
    ).toBeVisible();
  });

  test('F13: página de cadastro renderiza formulário', async ({ page }) => {
    await page.goto('/cadastrar');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(
      page.locator('input[type="password"], input[name="password"]').first(),
    ).toBeVisible();
  });
});
