import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve mostrar página de login', async ({ page }) => {
    await expect(page.getByText('MCO')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.getByLabel('E-mail').fill('demo@mco.vale.com');
    await page.getByLabel('Senha').fill('mco2026');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Should redirect to /missao
    await expect(page).toHaveURL(/.*missao/);
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.getByLabel('E-mail').fill('wrong@email.com');
    await page.getByLabel('Senha').fill('wrongpassword');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('E-mail não encontrado')).toBeVisible();
  });

  test('deve alternar visibilidade da senha', async ({ page }) => {
    const passwordInput = page.getByLabel('Senha');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click show password button
    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click hide password button
    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
