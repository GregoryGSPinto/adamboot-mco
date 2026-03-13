import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel('E-mail').fill('demo@mco.vale.com');
    await page.getByLabel('Senha').fill('mco2026');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*missao/);
  });

  test('deve navegar para página de projeto', async ({ page }) => {
    await page.getByRole('link', { name: /Processos/i }).click();
    await expect(page).toHaveURL(/.*projeto/);
  });

  test('deve navegar para página de notas', async ({ page }) => {
    await page.getByRole('link', { name: /Notas/i }).click();
    await expect(page).toHaveURL(/.*notas/);
  });

  test('deve navegar para página de perfil', async ({ page }) => {
    await page.getByRole('link', { name: /Perfil/i }).click();
    await expect(page).toHaveURL(/.*perfil/);
  });

  test('deve abrir dropdown Mais no desktop', async ({ page }) => {
    // Click on "Mais" dropdown
    await page.getByRole('button', { name: /Mais/i }).click();

    // Should show additional navigation items
    await expect(page.getByRole('link', { name: /Conversa/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Documentos/i })).toBeVisible();
  });
});
