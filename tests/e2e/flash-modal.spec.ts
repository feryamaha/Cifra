import { expect, test } from '@playwright/test';

/**
 * F17 (SPEC_010 C4-R2): modal flash com card slider, fechar só nos 5s
 * finais, barra "Anuncie aqui" e modal de contato comercial.
 * Este arquivo NÃO usa o fixture (que desliga o modal); testa o modal real.
 */

test.describe('Modal flash de publicidade', () => {
  test('F17: home mostra card slider, contagem, e fechar só nos 5s finais', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', { name: 'Publicidade' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Adicione aqui a sua publicidade');
    await expect(dialog).toContainText('Anuncie aqui a sua empresa');
    await expect(dialog).toContainText(/Fechamento automático em \d+s/);
    // Regra: nos primeiros segundos NÃO há botão fechar (10s de duração)
    const fechar = dialog.getByRole('button', { name: 'Fechar publicidade' });
    await expect(fechar).not.toBeVisible();
    // Aparece quando restam 5s
    await expect(fechar).toBeVisible({ timeout: 8_000 });
    await fechar.click();
    await expect(dialog).not.toBeVisible();
  });

  test('F17: na cifra mostra a mensagem de pré-roll e a cifra fica limpa depois', async ({
    page,
  }) => {
    await page.goto('/musica/bruna-olly-gratidao-005e9c');
    const dialog = page.getByRole('dialog', { name: 'Publicidade' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/sua cifra será exibida ao final/i);
    // Espera o fechamento automático completo (10s) e valida a cifra limpa
    await expect(dialog).not.toBeVisible({ timeout: 12_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Gratid/);
  });

  test('F17: e-mail da barra abre o contato; enviar só com tudo preenchido', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', { name: 'Publicidade' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /anuncie@/ }).click();

    const contato = page.getByRole('dialog', { name: 'Contato comercial' });
    await expect(contato).toBeVisible();
    const enviar = contato.getByRole('button', { name: 'Enviar' });
    await expect(enviar).toBeDisabled();

    await contato.getByLabel('Nome').fill('Fernando Teste');
    await contato.getByLabel('E-mail').fill('parceiro@empresa.com.br');
    await contato.getByLabel('Telefone').fill('(11) 99999-9999');
    await contato.getByLabel('Mensagem').fill('Quero anunciar minha loja de cordas.');
    await expect(enviar).toBeEnabled();
    await contato.getByRole('button', { name: 'Fechar contato' }).click();
    await expect(contato).not.toBeVisible();
  });

  test('F17: não aparece nas telas de auth', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page.getByRole('dialog', { name: 'Publicidade' })).not.toBeVisible();
  });
});
