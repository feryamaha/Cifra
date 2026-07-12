import { expect, test } from './fixtures';

/** F9: dicionário de acordes, metrônomo e afinador. */

test.describe('Ferramentas', () => {
  test('F9: dicionário busca C e mostra as 16 variações', async ({ page }) => {
    await page.goto('/acordes');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dicionário');

    const input = page.getByPlaceholder(/Ex: C, Dm/);
    await input.fill('C');
    await expect(page.getByText(/16 variações encontradas/)).toBeVisible();
    await expect(page.getByText('Posição 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Posição 16', { exact: true })).toBeVisible();
  });

  test('F9: dicionário reconhece notação BR complexa (Bm7(b5))', async ({ page }) => {
    await page.goto('/acordes');
    const input = page.getByPlaceholder(/Ex: C, Dm/);
    await input.fill('Bm7(b5)');
    await expect(page.getByText(/variaç(ão|ões) encontrada/)).toBeVisible();
    await expect(page.getByText('Posição 1', { exact: true })).toBeVisible();
  });

  test('F9: metrônomo renderiza controles', async ({ page }) => {
    await page.goto('/metronomo');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Metrônomo/i);
    expect(await page.getByRole('button').count()).toBeGreaterThan(0);
    await expect(page.locator('body')).toContainText(/BPM/i);
  });

  test('F9: afinador renderiza o medidor de arco e o botão de microfone', async ({ page }) => {
    await page.goto('/afinador');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Afinador/i);
    // Medidor novo (SPEC_010 rodada 4): arco SVG + instrução + mic redondo
    await expect(page.getByText('Pressione o microfone para começar a afinar')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Sem sinal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar microfone' })).toBeVisible();
  });
});
