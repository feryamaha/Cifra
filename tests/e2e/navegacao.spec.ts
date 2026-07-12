import { expect, test } from './fixtures';

/** F2: de-para home→cifra→voltar (regressão ISSUE_003); F10: menu global; F14: 404. */

test.describe('Navegação', () => {
  const SLUG = 'bruna-olly-gratidao-005e9c';

  test('F2: soft-nav home → cifra abre completa e voltar restaura a home', async ({ page }) => {
    await page.goto('/');

    await page.locator(`a[href="/musica/${SLUG}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/musica/${SLUG}`), { timeout: 20_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Gratid/);
    await expect(page.getByText('PROGRESSÕES DE ACORDES')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Controles' })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('O violão no centro');
  });

  test('F2: soft-nav em sequência (Em alta e Acervo, sem hang)', async ({ page }) => {
    await page.goto('/');
    await page.locator(`a[href="/musica/${SLUG}"]`).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Gratid/, {
      timeout: 20_000,
    });
    await page.goBack();
    await page.locator(`#acervo a[href="/musica/${SLUG}"]`).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Gratid/, {
      timeout: 20_000,
    });
  });

  const rotas = [
    ['/acordes', /Dicionário de acordes/i],
    ['/metronomo', /Metrônomo/i],
    ['/afinador', /Afinador/i],
    ['/historico', /Histórico|históric/i],
    ['/faq', /Perguntas frequentes/i],
    // /adicionar anônimo REDIRECIONA para login (invariante 12: enviar exige conta)
    ['/adicionar', /Entrar|login|conta/i, /\/(entrar|adicionar)/],
    ['/entrar', /Entrar|login/i],
  ] as [string, RegExp, RegExp?][];

  for (const [href, titulo, urlEsperada] of rotas) {
    test(`F10: menu global abre ${href}`, async ({ page }) => {
      await page.goto('/');
      const desktopLink = page.locator(`header nav a[href="${href}"]`).first();
      if (await desktopLink.isVisible().catch(() => false)) {
        await desktopLink.click();
      } else {
        // Nav desktop fica oculta no breakpoint atual: usar o menu mobile e
        // clicar só no link VISÍVEL (o oculto da nav desktop vem antes no DOM)
        await page.getByRole('button', { name: 'Menu' }).click();
        await page.locator(`header nav a[href="${href}"]:visible`).first().click();
      }
      await expect(page).toHaveURL(urlEsperada ?? new RegExp(`${href.replace('/', '\\/')}$`));
      await expect(page.locator('body')).toContainText(titulo, { timeout: 20_000 });
    });
  }

  test('F14: cifra inexistente mostra página de não encontrada', async ({ page }) => {
    // Com loading.tsx (SPEC_010 A4) a rota faz streaming: o status é 200 e o
    // not-found é renderizado no stream (Next injeta noindex). Validar conteúdo.
    await page.goto('/musica/nao-existe-xyz-000');
    await expect(page.getByText(/404|não encontrada|could not be found/i).first()).toBeVisible();
  });
});
