# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: conteudo.spec.ts >> Conteúdo e auth >> F11: FAQ abre um item e fecha o anterior (acordeão exclusivo)
- Location: tests/e2e/conteudo.spec.ts:6:7

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('button[aria-expanded]').first()
Expected: "false"
Received: "true"
Timeout:  15000ms

Call log:
  - Expect "toHaveAttribute" with timeout 15000ms
  - waiting for locator('button[aria-expanded]').first()
    32 × locator resolved to <button type="button" aria-label="Menu" aria-expanded="true" class="cursor-pointer rounded-md p-2 text-neutral-700 hover:text-primary-300 @Desktop:hidden">…</button>
       - unexpected value "true"

```

```yaml
- button "Menu" [expanded]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | /** F11: FAQ acordeão; F12: legais + footer; F13: superfícies de auth. */
  4  | 
  5  | test.describe('Conteúdo e auth', () => {
  6  |   test('F11: FAQ abre um item e fecha o anterior (acordeão exclusivo)', async ({ page }) => {
  7  |     await page.goto('/faq');
  8  |     const perguntas = page.locator('button[aria-expanded]');
  9  |     const primeira = perguntas.nth(0);
  10 |     const segunda = perguntas.nth(1);
  11 | 
  12 |     await primeira.click();
  13 |     await expect(primeira).toHaveAttribute('aria-expanded', 'true');
  14 | 
  15 |     await segunda.click();
  16 |     await expect(segunda).toHaveAttribute('aria-expanded', 'true');
> 17 |     await expect(primeira).toHaveAttribute('aria-expanded', 'false');
     |                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  18 |   });
  19 | 
  20 |   test('F12: política de privacidade renderiza seções LGPD', async ({ page }) => {
  21 |     await page.goto('/privacidade');
  22 |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade');
  23 |     await expect(page.getByText(/LGPD/).first()).toBeVisible();
  24 |     await expect(page.getByRole('heading', { name: /Seus direitos/ })).toBeVisible();
  25 |   });
  26 | 
  27 |   test('F12: termos de uso renderizam seções completas', async ({ page }) => {
  28 |     await page.goto('/termos');
  29 |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Termos de Uso');
  30 |     await expect(page.getByRole('heading', { name: /Propriedade intelectual/ })).toBeVisible();
  31 |     await expect(page.getByRole('heading', { name: /foro/i })).toBeVisible();
  32 |   });
  33 | 
  34 |   test('F12: footer leva para termos e privacidade', async ({ page }) => {
  35 |     await page.goto('/');
  36 |     await page.locator('footer a[href="/termos"]').first().click();
  37 |     await expect(page).toHaveURL(/\/termos$/);
  38 |     await page.goBack();
  39 |     await page.locator('footer a[href="/privacidade"]').first().click();
  40 |     await expect(page).toHaveURL(/\/privacidade$/);
  41 |   });
  42 | 
  43 |   test('F13: página de login renderiza formulário sem exigir conta', async ({ page }) => {
  44 |     await page.goto('/entrar');
  45 |     await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  46 |     await expect(
  47 |       page.locator('input[type="password"], input[name="password"]').first(),
  48 |     ).toBeVisible();
  49 |   });
  50 | 
  51 |   test('F13: página de cadastro renderiza formulário', async ({ page }) => {
  52 |     await page.goto('/cadastrar');
  53 |     await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  54 |     await expect(
  55 |       page.locator('input[type="password"], input[name="password"]').first(),
  56 |     ).toBeVisible();
  57 |   });
  58 | });
  59 | 
```