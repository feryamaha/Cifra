# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cifra.spec.ts >> Página de cifra >> F4: cifra publicada no Neon abre por URL direta
- Location: tests/e2e/cifra.spec.ts:23:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByRole('heading', { level: 1 })
Expected: "Gratidão"
Received: "Gratidão"
Timeout:  15000ms

Call log:
  - Expect "toHaveText" with timeout 15000ms
  - waiting for getByRole('heading', { level: 1 })
    28 × locator resolved to <h1 class="font-chakra text-3xl font-bold tracking-tight text-neutral-900 text-balance @tablet:text-4xl">Gratidão</h1>
       - unexpected value "Gratidão"

```

```yaml
- heading "Gratidão" [level=1]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | /** F3: demo URL direta; F4: cifra do Neon; F5: hover de shape; F16: deep-link. */
  4  | 
  5  | test.describe('Página de cifra', () => {
  6  |   test('F3: URL direta da demo renderiza o chrome completo', async ({ page }) => {
  7  |     await page.goto('/musica/estrada-de-terra');
  8  | 
  9  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estrada de Terra');
  10 |     await expect(page.getByText('Tom: C').first()).toBeVisible();
  11 | 
  12 |     for (const nome of ['Controles', 'Imprimir', 'Baixar', 'Compartilhar', 'Auto-rolagem']) {
  13 |       await expect(page.getByRole('button', { name: nome })).toBeVisible();
  14 |     }
  15 | 
  16 |     await expect(page.getByText('INTRODUÇÃO')).toBeVisible();
  17 |     await expect(page.getByText('VERSO 1')).toBeVisible();
  18 |     await expect(page.getByText('PROGRESSÕES DE ACORDES')).toBeVisible();
  19 |     await expect(page.locator('header')).toBeVisible();
  20 |     await expect(page.locator('footer')).toBeVisible();
  21 |   });
  22 | 
  23 |   test('F4: cifra publicada no Neon abre por URL direta', async ({ page }) => {
  24 |     await page.goto('/musica/bruna-olly-gratidao-005e9c');
  25 |     const naoEncontrada = await page
  26 |       .getByText('Música não encontrada')
  27 |       .isVisible()
  28 |       .catch(() => false);
  29 |     test.skip(naoEncontrada, 'DB indisponível ou cifra não publicada neste ambiente');
  30 | 
> 31 |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gratidão');
     |                                                           ^ Error: expect(locator).toHaveText(expected) failed
  32 |     await expect(page.getByText('INTRO', { exact: false }).first()).toBeVisible();
  33 |   });
  34 | 
  35 |   test('F5: hover no acorde mostra o shape e sair esconde', async ({ page }) => {
  36 |     await page.goto('/musica/estrada-de-terra');
  37 |     const acorde = page.getByRole('button', { name: /^Acorde C7M\./ }).first();
  38 |     await expect(acorde).toBeVisible();
  39 | 
  40 |     await acorde.hover();
  41 |     const tooltip = page.getByRole('tooltip');
  42 |     await expect(tooltip).toBeVisible();
  43 |     await expect(tooltip.locator('svg').first()).toBeVisible();
  44 | 
  45 |     await page.getByRole('heading', { level: 1 }).hover();
  46 |     await expect(tooltip).toBeHidden();
  47 |   });
  48 | 
  49 |   test('F16: deep-link ?tom=2 abre a cifra já transposta (C → D)', async ({ page }) => {
  50 |     await page.goto('/musica/estrada-de-terra?tom=2');
  51 |     await expect(page.getByRole('button', { name: /^Acorde D7M\./ }).first()).toBeVisible();
  52 |     await expect(page.getByText('Tom: D').first()).toBeVisible();
  53 |   });
  54 | });
  55 | 
```