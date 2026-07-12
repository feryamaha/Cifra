import { expect, test } from './fixtures';

/** F1: home completa; F7: busca, filtros e contador do acervo. */

test.describe('Home e catálogo', () => {
  test('F1: hero, CTAs, Em alta, Acervo e footer renderizam', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('O violão no centro');
    await expect(page.getByRole('link', { name: 'Explorar o acervo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Enviar minha cifra' })).toBeVisible();

    await expect(page.getByText('EM ALTA', { exact: false })).toBeVisible();
    // Catálogo real (SPEC_010): sem demos fake; ao menos Gratidão publicada
    const trendingLinks = page.locator('a[href^="/musica/"]');
    await expect(trendingLinks.first()).toBeVisible();
    expect(await trendingLinks.count()).toBeGreaterThanOrEqual(1);

    await expect(page.getByRole('heading', { name: 'Acervo' })).toBeVisible();
    await expect(page.getByText(/© \d{4} Cifra Tom/)).toBeVisible();
  });

  test('F7: busca por título filtra o acervo e atualiza o contador', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('searchbox', { name: 'Buscar músicas' });
    await expect(search).toBeVisible();

    await expect(page.getByText(/\d+ de \d+/)).toBeVisible();

    await search.fill('Gratidão');
    await expect(page.getByText(/^1 de \d+/)).toBeVisible();
    const cards = page.locator('#acervo a[href^="/musica/"]');
    await expect(cards).toHaveCount(1);
    // Regex: título vem do DB em Unicode NFD (acento decomposto)
    await expect(cards.first()).toContainText(/Gratid/);
  });

  test('F7: filtro por artista reduz resultados', async ({ page }) => {
    await page.goto('/');
    const artista = page.locator('select').nth(1);
    await artista.selectOption({ label: 'Bruna Olly' });
    const cards = page.locator('#acervo a[href^="/musica/"]');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Bruna Olly');
  });

  test('F1: CTA "Explorar o acervo" rola até o catálogo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Explorar o acervo' }).click();
    await expect(page).toHaveURL(/#acervo$/);
    await expect(page.getByRole('heading', { name: 'Acervo' })).toBeInViewport();
  });
});
